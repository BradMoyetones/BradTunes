import path from 'node:path'
import fs from 'node:fs'
import { getDb } from '../config/database';
import { exec } from 'node:child_process'
import { getTimestamp } from '../config/helpers';
import { Playlist, SongFull } from '../../types/data';
import { CurrentMusic } from '../../types/data';
import { colors } from '../../lib/colors';
import { promisify } from 'node:util';
import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from "electron-log";
import ProgressBar from "electron-progressbar";
import { platform } from 'node:os';
import { basePath, getMusicPath } from '../config/storage';

const execPromise = promisify(exec)
const repoOwner = "BradMoyetones"; // 🔹 Cambia esto por tu usuario o equipo de GitHub
const repoName = "BradTunes"; // 🔹 Cambia esto por el nombre de tu repo

// Detectar el sistema operativo
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';


export const ytDlpPath = isWindows ? path.join(basePath, 'yt-dlp.exe') : isMac ? path.join(basePath, 'yt-dlp_macos') : '';
export const ffmpegPath = isWindows ? path.join(basePath, 'ffmpeg.exe') : isMac ? path.join(basePath, 'ffmpeg') : '';

// console.log('YT-DLP Path:', ytDlpPath);
// console.log('FFmpeg Path:', ffmpegPath);
// console.log('Output Directory:', outputDir);
// console.log('Image Directory:', imgDir);

// Configurar electron-log correctamente
log.transports.file.level = "info";
autoUpdater.logger = log; // Asigna el logger sin modificarlo directamente

// Deshabilitar la descarga automática
autoUpdater.autoDownload = false;

async function releasesLatest() {
  try {
    const { stdout: latestVersionInfo } = await execPromise(
      `curl -s https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );

    const latestVersionData = JSON.parse(latestVersionInfo);
    
    return {
      data: latestVersionData
    }
  } catch (error) {
    console.error("Error get releasesLatest:", error);
    return {
      data: {}
    }
  }
}

export async function verifyVersionApp() {
  try {
    const currentVersion = app.getVersion().trim();

    // Obtener la última versión publicada en GitHub Releases
    const { stdout: latestVersionInfo } = await execPromise(
      `curl -s https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );

    // Limpiar espacios en blanco y extraer la versión correctamente
    const latestVersionData = JSON.parse(latestVersionInfo);
    const latestVersion = latestVersionData?.tag_name?.replace(/^v/, '') || null;

    return {
      currentVersion,
      newVersion: latestVersion && latestVersion !== currentVersion ? latestVersion : null,
      message:
        latestVersion && latestVersion !== currentVersion
          ? `New version available: ${latestVersion}`
          : "You have the latest version",
      latestVersionInfo,
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error checking for updates",
    };
  }
}

export async function installLatestVersionApp() {
  try {
    // Verificar si hay una nueva versión disponible
    const checkUpdate = await verifyVersionApp(); // Asegúrate de que esta función esté bien implementada

    // Si no hay nueva versión, retornamos la respuesta
    if (!checkUpdate.newVersion || checkUpdate.newVersion === checkUpdate.currentVersion) {
      return {
        currentVersion: checkUpdate.currentVersion,
        newVersion: null,
        message: "You already have the latest version.",
      };
    }

    // Mostrar un cuadro de mensaje preguntando si el usuario quiere actualizar
    const userResponse = await dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: `A new version (${checkUpdate.newVersion}) is available. Do you want to update now?`,
      buttons: ["Update", "Cancel"],
    });

    if (userResponse.response !== 0) {
      return { currentVersion: checkUpdate.currentVersion, newVersion: checkUpdate.newVersion, message: "Update canceled." };
    }

    // Obtener los datos de la última versión desde GitHub
    const releaseData = await releasesLatest();

    // Verificamos si los datos son válidos y contienen "assets"
    if (!releaseData || !releaseData.data || !releaseData.data.assets || releaseData.data.assets.length === 0) {
      console.error('No valid assets found in release data:', releaseData); // Imprimir la respuesta completa
      throw new Error('Failed to fetch valid release data or assets.');
    }

    // Mostrar los assets para depuración
    console.log('Assets:', releaseData.data.assets);

    const currentOS = platform(); // Detectar el sistema operativo
    let downloadUrl = '';

    // Buscamos el archivo adecuado según el sistema operativo
    if (currentOS === 'darwin') {
      // Buscar archivo .dmg para macOS
      const macAsset = releaseData.data.assets.find((asset: any) => asset.name.endsWith('.dmg'));
      if (macAsset) {
        downloadUrl = macAsset.browser_download_url; // Utilizar browser_download_url directamente
      } else {
        throw new Error('No .dmg file found for macOS.');
      }
    } else if (currentOS === 'win32') {
      // Buscar archivo .exe para Windows
      const windowsAsset = releaseData.data.assets.find((asset: any) => asset.name.endsWith('.exe'));
      if (windowsAsset) {
        downloadUrl = windowsAsset.browser_download_url; // Utilizar browser_download_url directamente
      } else {
        throw new Error('No .exe file found for Windows.');
      }
    } else {
      throw new Error('Unsupported OS');
    }

    // Si no se encontró el enlace de descarga
    if (!downloadUrl) {
      throw new Error('No appropriate download asset found.');
    }

    // Verificar si hay una actualización disponible antes de proceder con la descarga
    const updateInfo = await autoUpdater.checkForUpdates();
    if (updateInfo?.updateInfo.version !== checkUpdate.newVersion) {
      throw new Error('Please check update first');
    }

    // Si es macOS, solo devolvemos el enlace para que el usuario lo descargue
    if (currentOS === 'darwin') {
      return {
        currentVersion: checkUpdate.newVersion,
        newVersion: null,
        message: `Download the latest version for macOS: ${downloadUrl}. Please drag the app to your Applications folder.`,
      };
    }

    let progressBar = new ProgressBar({
      indeterminate: false,
      text: "Downloading update...",
      detail: "Please wait...",
      abortOnError: true,
      closeOnComplete: false,
      browserWindow: { alwaysOnTop: true },
    });

    progressBar
      .on("completed", () => {
        progressBar.detail = "Update downloaded. Preparing installation...";
      })
      .on("progress", (value) => {
        progressBar.detail = `Downloaded ${value}%...`;
      });

    // Si es Windows, comenzamos la descarga utilizando el autoUpdater
    autoUpdater.setFeedURL({
      provider: 'generic',  // Usamos un servidor genérico
      url: downloadUrl      // El enlace de descarga (archivo .exe o .dmg)
    });

    // Descargar la actualización
    autoUpdater.downloadUpdate();

    // Progreso de la descarga
    autoUpdater.on('download-progress', (progressObj) => {
      progressBar.value = progressObj.percent;
      progressBar.detail = `Downloaded ${progressObj.transferred} of ${progressObj.total} bytes (${progressObj.percent}%)`;
    });

    // Esperamos a que se descargue la actualización
    return new Promise((resolve) => {
      autoUpdater.on('update-downloaded', async () => {
        progressBar.close();

        // Preguntar al usuario si desea reiniciar la aplicación para instalar
        const confirmRestart = await dialog.showMessageBox({
          type: "info",
          title: "Update Ready",
          message: "Update has been downloaded. Do you want to restart now?",
          buttons: ["Restart", "Later"],
        });

        if (confirmRestart.response === 0) {
          autoUpdater.quitAndInstall(false, true); // Reiniciar para instalar
        }

        resolve({
          currentVersion: checkUpdate.newVersion,
          newVersion: null,
          message: "Update downloaded. Restart required.",
        });
      });
    });

  } catch (error) {
    console.error("Error updating the app:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error updating the app: "+error,
    };
  }
}




export async function verifyVersion() {
  try {
    // Obtener la versión actual instalada
    const { stdout: currentVersion } = await execPromise(`"${ytDlpPath}" --version`);

    // Consultar la última versión disponible sin actualizar
    const { stdout: latestVersionInfo } = await execPromise(
      `curl -s https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest`
    );

    // Limpiar espacios en blanco y extraer la versión correctamente
    const latestVersionData = JSON.parse(latestVersionInfo);
    const latestVersion = latestVersionData?.tag_name?.replace(/^v/, '') || null;

    return {
      currentVersion: currentVersion.trim(),
      newVersion: latestVersion && latestVersion !== currentVersion.trim() ? latestVersion : null,
      message: latestVersion && latestVersion !== currentVersion.trim()
        ? `New version available: ${latestVersion}`
        : "You have the latest version",
      latestVersionInfo
    };
  } catch (error) {
    console.error("Error checking YT-DLP version:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error checking YT-DLP version"
    };
  }
}

export async function installLatestVersion() {
  try {
    // Ejecutar la actualización de yt-dlp
    await execPromise(`"${ytDlpPath}" -U`);

    // Obtener la versión actualizada
    const { stdout: updatedVersion } = await execPromise(`"${ytDlpPath}" --version`);

    return {
      currentVersion: updatedVersion.trim(),
      newVersion: null, // Ya está actualizado, así que no hay nueva versión pendiente
      message: "You have the latest version"
    };
  } catch (error) {
    console.error("Error updating YT-DLP:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error updating YT-DLP"
    };
  }
}

export async function downloadSong(videoUrl: string) {
  const db = await getDb();
  const musicPath = await getMusicPath(); // 🔹 Espera la ruta correcta
  const outputDir = musicPath;
  const imgDir = path.join(outputDir, 'img');

  console.log('ytDlpPath:', ytDlpPath);
  if (!fs.existsSync(ytDlpPath)) {
    throw new Error('yt-dlp.exe not found');
  }

  if (!fs.existsSync(ffmpegPath)) {
    throw new Error('ffmpeg.exe not found');
  }

  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const metadataCommand = `"${ytDlpPath}" -j "${videoUrl}"`;
    exec(metadataCommand, (metadataError, metadataStdout, metadataStderr) => {
      if (metadataError) {
        reject(`Metadata Error: ${metadataError.message}`);
        return;
      } else if (metadataStderr) {
        reject(`Metadata Stderr: ${metadataStderr}`);
        return;
      }

      let metadata;
      try {
        metadata = JSON.parse(metadataStdout);
        console.log('Metadata:', metadata);
      } catch (parseError) {
        reject(`Metadata Parse Error: ${(parseError as Error).message}`);
        return;
      }

      const sanitizeFilename = (name: string) => {
        return name
          .replace(/[\\/:*?"<>|]/g, '_') // Evitar caracteres no válidos en nombres de archivos
          .replace(/\s+/g, ' ') // Normalizar espacios
          .trim(); // Eliminar espacios innecesarios
      };

      const timestamp = Date.now();
      const title = sanitizeFilename(metadata.title || 'Unknown Title');
      const artist = sanitizeFilename(metadata.channel || 'Unknown Artist');
      const duration = metadata.duration_string || 'Unknown Time';

      // Establecer nombres explícitos para MP3 e imagen
      const mp3Filename = `${timestamp}.mp3`;
      const mp4Filename = `${timestamp}.mp4`;
      const thumbnailFilename = `${timestamp}.jpg`;

      // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
      // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" -f mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
      // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" -f "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
      const command = `"${ytDlpPath}" --ffmpeg-location "${ffmpegPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" --ffmpeg-location "${ffmpegPath}" -f "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;

      exec(command, (error, _stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
        } else if (stderr) {
          reject(`Stderr: ${stderr}`);
        } else {
          fs.readdir(outputDir, (err, files) => {
            if (err) {
              reject(`Error reading directory: ${err.message}`);
              return;
            }

            const mp3Files = files.filter((file) => file.endsWith('.mp3'));
            const thumbnailFiles = files.filter((file) =>
              /\.(webp|jpeg|jpg|png|gif|svg)$/i.test(file)
            );

            if (mp3Files.length > 0) {
              // Mover la miniatura a la carpeta img
              const thumbnailFile = thumbnailFiles.find((thumb) =>
                thumb.includes(`${timestamp}`)
              );

              if (thumbnailFile) {
                const srcThumbnailPath = path.join(outputDir, thumbnailFile);
                const destThumbnailPath = path.join(imgDir, thumbnailFilename);
                fs.renameSync(srcThumbnailPath, destThumbnailPath);
              }

              const createdAt = getTimestamp();

              const stmt = db.prepare(`
                INSERT INTO songs (title, artist, song, video, image, duration, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING id
              `);

              stmt.run(
                title,
                artist,
                `${mp3Filename}`,
                `${mp4Filename}`,
                `${thumbnailFilename}`,
                duration,
                createdAt,
                (err: Error | null) => {
                  if (err) {
                    reject(`Error inserting into database: ${err.message}`);
                  } else {
                    const newId = stmt.lastID;

                    // Recupera el objeto recién creado
                    const selectStmt = db.prepare(`
                      SELECT * FROM songs WHERE id = ?
                    `);
                    selectStmt.get(newId, (err: Error | null, row: any) => {
                      if (err) {
                        reject(
                          `Error retrieving from database: ${err.message}`
                        );
                      } else {
                        const newSong: SongFull = {
                          id: row.id,
                          title: row.title,
                          artist: row.artist,
                          song: row.song,
                          video: row.video,
                          image: row.image,
                          reproductions: row.reproductions,
                          duration: row.duration,
                          date: row.date,
                          playlist_songs: [],
                        };
                        resolve(newSong);
                      }
                    });
                  }
                }
              );

              stmt.finalize();
            } else {
              resolve('No MP3 or thumbnail files found.');
            }
          });
        }
      });
    });
  });
}

export async function songs(currentPlaylist: Playlist | null, currentSong: SongFull | null): Promise<CurrentMusic> {
  const db = await getDb();

  return new Promise((resolve, reject) => {
    let query = `
      SELECT
        m.id AS song_id,
        m.title,
        m.artist,
        m.song,
        m.video,
        m.image,
        m.reproductions,
        m.duration,
        m.date AS song_date,
        ps.id AS playlist_song_id,
        ps.playlist_id,
        ps.date AS playlist_song_date
      FROM songs m
      LEFT JOIN playlist_songs ps ON m.id = ps.song_id
    `;

    let queryParams: any[] = [];

    if (currentPlaylist) {
      query += ` WHERE ps.playlist_id = ?`;
      queryParams.push(currentPlaylist.id);
    }

    db.all(query, queryParams, (err: Error | null, rows: any[]) => {
      if (err) {
        reject(`Error fetching songs: ${err.message}`);
        return;
      }

      const songsMap = new Map<number, SongFull>();

      rows.forEach(row => {
        if (!songsMap.has(row.song_id)) {
          songsMap.set(row.song_id, {
            id: row.song_id,
            title: row.title,
            artist: row.artist,
            song: row.song,
            video: row.video,
            image: row.image,
            reproductions: row.reproductions,
            duration: row.duration,
            date: row.song_date,
            playlist_songs: [],
          });
        }

        if (row.playlist_song_id) {
          songsMap.get(row.song_id)?.playlist_songs.push({
            id: row.playlist_song_id,
            playlist_id: row.playlist_id,
            song_id: row.song_id,
            date: row.playlist_song_date,
          });
        }
      });

      const songs = Array.from(songsMap.values());

      let selectedSong: SongFull | null = currentSong;

      if (!selectedSong && songs.length > 0) {
        selectedSong = songs[0]; // Si no hay `currentSong`, seleccionamos la primera canción disponible
      }

      resolve({
        playlist: currentPlaylist,
        song: selectedSong,
        songs
      });
    });
  });
}

export async function songsXplaylist(playlistId: number): Promise<SongFull[]> {
  const db = await getDb();

  return new Promise((resolve, reject) => {
    let query = `
      SELECT
        m.id AS song_id,
        m.title,
        m.artist,
        m.song,
        m.video,
        m.image,
        m.reproductions,
        m.duration,
        m.date AS song_date,
        ps.id AS playlist_song_id,
        ps.playlist_id,
        ps.date AS playlist_song_date
      FROM songs m
      LEFT JOIN playlist_songs ps ON m.id = ps.song_id
    `;

    let queryParams: any[] = [];

    if (playlistId) {
      query += ` WHERE ps.playlist_id = ?`;
      queryParams.push(playlistId);
    }

    db.all(query, queryParams, (err: Error | null, rows: any[]) => {
      if (err) {
        reject(`Error fetching songs: ${err.message}`);
        return;
      }

      const songsMap = new Map<number, SongFull>();

      rows.forEach(row => {
        if (!songsMap.has(row.song_id)) {
          songsMap.set(row.song_id, {
            id: row.song_id,
            title: row.title,
            artist: row.artist,
            song: row.song,
            video: row.video,
            image: row.image,
            reproductions: row.reproductions,
            duration: row.duration,
            date: row.song_date,
            playlist_songs: [],
          });
        }

        if (row.playlist_song_id) {
          songsMap.get(row.song_id)?.playlist_songs.push({
            id: row.playlist_song_id,
            playlist_id: row.playlist_id,
            song_id: row.song_id,
            date: row.playlist_song_date,
          });
        }
      });

      resolve(Array.from(songsMap.values()));
    });
  });
}

export async function getSongById(id: number): Promise<SongFull | null> {
  const db = await getDb();

  return new Promise((resolve, reject) => {
    const selectQuery = `SELECT * FROM songs WHERE id = ?`;

    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        reject(`Error fetching song: ${err.message}`);
        return;
      }

      if (!row) {
        resolve(null); // Retorna null si no encuentra la canción
        return;
      }

      const song: SongFull = {
        id: row.id,
        title: row.title,
        artist: row.artist,
        song: row.song,
        video: row.video,
        image: row.image,
        reproductions: row.reproductions,
        duration: row.duration,
        date: row.date,
        playlist_songs: [],
      };

      // Consultar las playlists asociadas
      const playlistQuery = `
        SELECT
          ps.id AS playlist_song_id,
          ps.playlist_id,
          ps.song_id,
          ps.date AS playlist_song_date,
          p.id AS playlist_id,
          p.title AS playlist_title,
          p.color AS playlist_color,
          p.cover AS playlist_cover,
          p.date AS playlist_date
        FROM playlist_songs ps
        JOIN playlists p ON ps.playlist_id = p.id
        WHERE ps.song_id = ?;
      `;

      db.all(playlistQuery, [id], (err2, playlistRows) => {
        if (err2) {
          reject(`Error fetching playlists: ${err2.message}`);
          return;
        }

        song.playlist_songs = playlistRows.map((playlistRow) => ({
          id: playlistRow.playlist_song_id,
          playlist_id: playlistRow.playlist_id,
          song_id: playlistRow.song_id,
          date: playlistRow.playlist_song_date,
          playlist: {
            id: playlistRow.playlist_id,
            title: playlistRow.playlist_title,
            color: colors[playlistRow.playlist_color as keyof typeof colors] || colors.red,
            cover: playlistRow.playlist_cover,
            date: playlistRow.playlist_date,
          },
        }));

        resolve(song);
      });
    });
  });
}


export async function updateSong(
  id: number,
  title: string,
  artist: string,
  image: string | undefined  // Aceptamos la imagen en formato base64
): Promise<SongFull> {
  const db = await getDb();
  const musicPath = await getMusicPath(); // 🔹 Espera la ruta correcta
  const outputDir = musicPath;
  const imgDir = path.join(outputDir, 'img');

  return new Promise((resolve, reject) => {
    const sanitizeFilename = (name: string) => {
      return name
        .replace(/[\\/:*?"<>|]/g, '_')  // Evitar caracteres no válidos en nombres de archivos
        .replace(/\s+/g, ' ')           // Normalizar espacios
        .trim();                        // Eliminar espacios innecesarios
    };

    const timestamp = Date.now();
    const sanitizedTitle = sanitizeFilename(title);
    const sanitizedArtist = sanitizeFilename(artist);

    let imagePath: string | null = null;

    // Primero, obtenemos la canción actual para eliminar la imagen anterior si existe
    const selectQuery = `SELECT * FROM songs WHERE id = ?`;
    db.get(selectQuery, [id], (err2, row) => {
      if (err2) {
        reject(`Error fetching song for update: ${err2.message}`);
        return;
      }

      if (!row) {
        reject('Record not found');
        return;
      }

      // Eliminar la imagen anterior si existe
      if (row.image && image !== undefined) {
        const oldImagePath = path.join(outputDir, row.image.replace(/^music\//, ''));
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);  // Eliminar el archivo de la imagen anterior
          } catch (fileError) {
            reject(`Error deleting old image: ${(fileError as Error).message}`);
            return;
          }
        }
      }

      // Si hay una nueva imagen base64, procesarla
      if (image) {
        try {
          // Convertimos la cadena base64 en un buffer para escribirla como archivo
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');  // Eliminamos el prefijo 'data:image/...'
          const buffer = Buffer.from(base64Data, 'base64');

          // Determinar la extensión de la imagen
          const extensionMatch = image.match(/^data:image\/(\w+);base64,/);
          const extension = extensionMatch ? extensionMatch[1] : 'png'; // Usamos 'png' como predeterminado si no se encuentra

          // Generamos el nombre y la ruta de la imagen
          const imageFilename = `${timestamp}.${extension}`;
          const imageDestination = path.join(imgDir, imageFilename);

          // Crear directorio si no existe
          if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
          }

          // Guardar la imagen como archivo
          fs.writeFileSync(imageDestination, buffer);

          imagePath = `${imageFilename}`;
        } catch (err) {
          reject(`Error saving image: ${(err as Error).message}`);
          return;
        }
      }

      // Consulta SQL para actualizar la canción
      const updateQuery = `
        UPDATE songs
        SET title = ?, artist = ? ${imagePath ? ', image = ? ' : ''}
        WHERE id = ?;
      `;

      const params = [sanitizedTitle, sanitizedArtist, ...(imagePath ? [imagePath] : []), id];

      db.run(updateQuery, params, function (err) {
        if (err) {
          reject(`Error updating song: ${err.message}`);
          return;
        }

        // Obtener la canción actualizada después de la modificación
        const updatedSelectQuery = `SELECT * FROM songs WHERE id = ?`;
        db.get(updatedSelectQuery, [id], (err3, updatedRow) => {
          if (err3) {
            reject(`Error fetching updated song: ${err3.message}`);
            return;
          }

          const updatedSongBase: SongFull = {
            id: updatedRow.id,
            title: updatedRow.title,
            artist: updatedRow.artist,
            song: updatedRow.song,
            video: updatedRow.video,
            image: updatedRow.image,
            reproductions: updatedRow.reproductions,
            duration: updatedRow.duration,
            date: updatedRow.date,
            playlist_songs: [],
          };

          // Consultar las playlists asociadas
          const playlistQuery = `
            SELECT
              ps.id AS playlist_song_id,
              ps.playlist_id,
              ps.song_id,
              ps.date AS playlist_song_date,
              p.id AS playlist_id,
              p.title AS playlist_title,
              p.color AS playlist_color,
              p.cover AS playlist_cover,
              p.date AS playlist_date
            FROM playlist_songs ps
            JOIN playlists p ON ps.playlist_id = p.id
            WHERE ps.song_id = ?;
          `;

          db.all(playlistQuery, [id], (err4, playlistRows) => {
            if (err4) {
              reject(`Error fetching playlists: ${err4.message}`);
              return;
            }

            updatedSongBase.playlist_songs = playlistRows.map((playlistRow) => ({
              id: playlistRow.playlist_song_id,
              playlist_id: playlistRow.playlist_id,
              song_id: playlistRow.song_id,
              date: playlistRow.playlist_song_date,
              playlist: {
                id: playlistRow.playlist_id,
                title: playlistRow.playlist_title,
                color: colors[playlistRow.playlist_color as keyof typeof colors] || colors.red,
                cover: playlistRow.playlist_cover,
                date: playlistRow.playlist_date,
              },
            }));

            resolve(updatedSongBase);  // Resolvemos con la canción actualizada
          });
        });
      });
    });
  });
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const deleteFile = async (filePath: string, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
        console.log(`✅ Archivo eliminado: ${filePath}`);
      }
      return;
    } catch (error: any) {
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        console.warn(`⚠️ Archivo ocupado, reintentando... (${i + 1}/${retries})`);
        await wait(500); // Espera 500ms antes de reintentar
      } else {
        throw error;
      }
    }
  }
  throw new Error(`❌ No se pudo eliminar el archivo: ${filePath}`);
};

export async function deleteSong(id: number): Promise<boolean> {
  const db = await getDb();
  const musicPath = await getMusicPath();
  const outputDir = musicPath;

  return new Promise((resolve, reject) => {
    db.get('SELECT song, video, image FROM songs WHERE id = ?', [id], async (err: Error | null, row: any) => {
      if (err) return reject(`Error fetching record: ${err.message}`);
      if (!row) return reject('Record not found');

      const mp3Path = path.join(outputDir, row.song);
      const imagePath = path.join(outputDir, 'img', row.image);
      const videoPath = row.video ? path.join(outputDir, row.video) : null;

      try {
        if (videoPath) await deleteFile(videoPath);
        await deleteFile(imagePath);
        await deleteFile(mp3Path);
      } catch (fileError) {
        return reject(`Error deleting files: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }

      const stmt = db.prepare("DELETE FROM songs WHERE id = ?");
      stmt.run(id, function (err: Error | null) {
        if (err) {
          reject(`Error deleting from database: ${err.message}`);
        } else {
          resolve(true);
        }
      });
      stmt.finalize();
    });
  });
}
