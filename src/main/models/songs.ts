import path from 'node:path'
import fs from 'node:fs'
import { exec } from 'node:child_process'
import { getTimestamp } from '../config/helpers';
import { promisify } from 'node:util';
import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from "electron-log";
import ProgressBar from "electron-progressbar";
import { platform } from 'node:os';
import { basePath, getMusicPath } from '../config/storage';
import { getDb } from '@core/drizzle/client';
import { playlists, playlistSongs, songs } from '@core/drizzle/schema';
import { SongFull } from '@core/types/data';
import { eq, inArray } from 'drizzle-orm';
import { deleteFile } from '@core/utils/deleteFile';

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

const sanitizeFilename = (name: string) =>
  name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();

export async function downloadAndSaveSong(videoUrl: string): Promise<SongFull> {
  const db = await getDb();
  const musicPath = await getMusicPath();
  const imgDir = path.join(musicPath, 'img');
  fs.mkdirSync(imgDir, { recursive: true });

  // 1. Obtener metadata
  const metadata = await new Promise<any>((resolve, reject) => {
    const cmd = `"${ytDlpPath}" --ffmpeg-location ${ffmpegPath} -j "${videoUrl}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) return reject(err || stderr);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(`Error parseando metadata: ${e}`);
      }
    });
  });

  const timestamp = Date.now();
  const title = sanitizeFilename(metadata.title || 'Unknown Title');
  const artist = sanitizeFilename(metadata.channel || 'Unknown Artist');
  const duration = metadata.duration || null;

  const mp3Filename = `${timestamp}.mp3`;
  const mp4Filename = `${timestamp}.mp4`;
  const thumbnailFilename = `${timestamp}.jpg`;

  // 2. Descargar audio e imagen
  // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
  // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" -f mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
  // const command = `"${ytDlpPath}" -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" -f "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
  // const command = `"${ytDlpPath}" --ffmpeg-location ${ffmpegPath} -x --audio-format mp3 --write-thumbnail -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" --ffmpeg-location ${ffmpegPath} -f "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${outputDir}/${timestamp}.%(ext)s" "${videoUrl}"`;
  
  const command = `"${ytDlpPath}" --ffmpeg-location ${ffmpegPath} -x --audio-format mp3 --write-thumbnail -o "${musicPath}/${timestamp}.%(ext)s" "${videoUrl}" && "${ytDlpPath}" --ffmpeg-location ${ffmpegPath} -f "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${musicPath}/${timestamp}.%(ext)s" "${videoUrl}"`;

  await new Promise((resolve, reject) => {
    exec(command, (err, _stdout, stderr) => {
      if (err || stderr) return reject(err || stderr);
      resolve(true);
    });
  });

  // 3. Mover imagen
  const files = fs.readdirSync(musicPath);
  const thumbnail = files.find(f => f.includes(`${timestamp}`) && /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (thumbnail) {
    fs.renameSync(path.join(musicPath, thumbnail), path.join(imgDir, thumbnailFilename));
  }

  // 4. Insertar en DB
  const createdAt = getTimestamp();

  const inserted = await db
    .insert(songs)
    .values({
      title,
      artist,
      song: mp3Filename,
      video: mp4Filename, // Opcional
      image: thumbnailFilename,
      duration,
      date: createdAt,
    })
    .returning();

  const songInserted = inserted[0];

  const songFull = await db.query.songs.findFirst({
    where: (s, { eq }) => eq(s.id, songInserted.id),
    with: {
      playlist_songs: true,
    },
  });

  if (!songFull) {
    throw new Error("Inserted song could not be retrieved");
  }

  return songFull;
}

export async function songsAll(): Promise<SongFull[]> {
  const db = await getDb();
  
  // todas las canciones y sus relaciones
  let rows = await db.query.songs.findMany({
    with: {
      playlist_songs: true,
    },
  });

  return rows
}

export async function songsXplaylist(playlistId: string | undefined): Promise<SongFull[]> {
  if(!playlistId) return []
  const db = await getDb();
  
  // 1. Obtener relaciones playlist_songs por playlistId
  const playlistSongRows = await db
    .select()
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId));

  if (playlistSongRows.length === 0) return [];

  // 2. Obtener IDs de canciones asociadas
  const songIds = playlistSongRows.map(row => row.songId);

  // 3. Obtener canciones por esos IDs
  const songRows = await db
    .select()
    .from(songs)
    .where(inArray(songs.id, songIds));

  // 4. Agrupar playlistSongs por canción
  const map = new Map<string, SongFull>();

  for (const song of songRows) {
    map.set(song.id, {
      ...song,
      playlist_songs: [],
    });
  }

  for (const ps of playlistSongRows) {
    const entry = map.get(ps.songId);
    if (entry) {
      entry.playlist_songs.push(ps);
    }
  }

  return Array.from(map.values());
}

export async function getSongById(id: string): Promise<SongFull | null> {
  const db = await getDb();

  const songRow = await db.query.songs.findFirst({
    where: eq(songs.id, id),
  });

  if (!songRow) return null;

  const playlistSongRows = await db
    .select({
      psId: playlistSongs.id,
      psPlaylistId: playlistSongs.playlistId,
      psSongId: playlistSongs.songId,
      psDate: playlistSongs.date,
    })
    .from(playlistSongs)
    .where(eq(playlistSongs.songId, id));

  const song: SongFull = {
    ...songRow,
    playlist_songs: playlistSongRows.map((row) => ({
      id: row.psId,
      playlistId: row.psPlaylistId,
      songId: row.psSongId,
      date: row.psDate,
    })),
  };

  return song;
}

export async function updateSong(
  id: string,
  title: string,
  artist: string,
  image: string | undefined
): Promise<SongFull> {
  const db = await getDb();
  const musicPath = await getMusicPath();
  const outputDir = musicPath;
  const imgDir = path.join(outputDir, 'img');

  const timestamp = Date.now();
  const sanitizedTitle = sanitizeFilename(title);
  const sanitizedArtist = sanitizeFilename(artist);

  // 🔹 1. Buscar canción actual
  const song = await db.query.songs.findFirst({
    where: eq(songs.id, id),
  });

  if (!song) {
    throw new Error('Song not found');
  }

  let imagePath: string | null = song.image;

  // 🔹 2. Eliminar imagen anterior si hay nueva
  if (song.image && image !== undefined) {
    const oldImagePath = path.join(imgDir, song.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // 🔹 3. Procesar nueva imagen
  if (image) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const extensionMatch = image.match(/^data:image\/(\w+);base64,/);
    const extension = extensionMatch ? extensionMatch[1] : 'png';
    const imageFilename = `${timestamp}.${extension}`;
    const imageDestination = path.join(imgDir, imageFilename);

    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }

    fs.writeFileSync(imageDestination, buffer);
    imagePath = imageFilename;
  }

  // 🔹 4. Actualizar canción
  await db.update(songs)
    .set({
      title: sanitizedTitle,
      artist: sanitizedArtist,
      image: imagePath ?? null,
    })
    .where(eq(songs.id, id));

  // 🔹 5. Volver a obtener la canción actualizada
  const updated = await db.query.songs.findFirst({
    where: eq(songs.id, id),
  });

  if (!updated) {
    throw new Error('Updated song not found');
  }

  // 🔹 6. Obtener playlists asociadas
  const relations = await db.select({
    psId: playlistSongs.id,
    psDate: playlistSongs.date,
    playlist: {
      id: playlists.id,
      title: playlists.title,
      cover: playlists.cover,
      date: playlists.date,
    }
  }).from(playlistSongs)
    .innerJoin(playlists, eq(playlists.id, playlistSongs.playlistId))
    .where(eq(playlistSongs.songId, id));

  const result: SongFull = {
    id: updated.id,
    title: updated.title,
    artist: updated.artist,
    song: updated.song,
    video: updated.video,
    image: updated.image,
    reproductions: updated.reproductions,
    duration: updated.duration,
    date: updated.date,
    playlist_songs: relations.map((row) => ({
      id: row.psId,
      playlistId: row.playlist.id,
      songId: id,
      date: row.psDate,
    })),
  };

  return result;
}

export async function deleteSong(id: string): Promise<boolean> {
  const db = await getDb();
  const musicPath = await getMusicPath();
  const outputDir = musicPath;

  const song = await db.query.songs.findFirst({
    where: eq(songs.id, id),
  });

  if (!song) throw new Error('Record not found');

  const mp3Path = path.join(outputDir, song.song);
  const imagePath = path.join(outputDir, 'img', song.image ?? '');
  const videoPath = song.video ? path.join(outputDir, song.video) : null;

  try {
    if (videoPath) await deleteFile(videoPath);
    if (song.image) await deleteFile(imagePath);
    await deleteFile(mp3Path);
  } catch (err: any) {
    throw new Error(`Error deleting files: ${err.message}`);
  }

  await db.delete(songs).where(eq(songs.id, id));

  return true;
}
