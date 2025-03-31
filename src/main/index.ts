import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeDatabase } from './config/database'
import { deleteSong, downloadSong, songs, updateSong, songsXplaylist, verifyVersion, installLatestVersion, getSongById, verifyVersionApp, installLatestVersionApp, ytDlpPath, ffmpegPath } from './models/songs'
import { createPlaylist, deletePlaylist, playlists, updatePlaylist } from './models/playlists'
import { addMusicToPlaylist, deletePlaylistSong, playlistSong } from './models/playlist_songs'
import { getMusicPath, isDefaultMusicPath, resetMusicPath, setMusicPath } from './config/storage'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

initializeDatabase();

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 700,
    minHeight: 700,
    minWidth: 1080,
    show: false,
    frame: process.platform !== 'darwin', // Solo false en Windows/Linux, true en macOS
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    titleBarOverlay: process.platform === 'darwin' ? { height: 64 } : undefined,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {icon}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true, // Asegúrate de que esté en true
      nodeIntegration: false, // Esto debe estar en false para evitar problemas de seguridad
      devTools: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Error que me dio en producción
    // mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    mainWindow.loadFile(path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', 'index.html'))
  }
}

const openWindows = new Map<string, BrowserWindow>();

function createNewWindow(url: string): BrowserWindow {
  // Si ya existe una ventana con esta URL, enfócala y retorna
  for (const [openUrl, window] of openWindows.entries()) {
    if (openUrl === url && !window.isDestroyed()) {
      window.focus();
      return window;
    }
  }

  // Crea una nueva ventana si no existe
  const newWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minHeight: 700,
    minWidth: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  newWindow.loadURL(url);

  // Guarda la ventana en el mapa
  openWindows.set(url, newWindow);

  // Elimina la ventana del mapa cuando se cierre
  newWindow.on('closed', () => {
    openWindows.delete(url);
  });

  return newWindow;
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.registerFileProtocol('safe-file', (request, callback) => {
    const url = request.url.replace('safe-file://', '');
    callback({ path: path.normalize(url) });
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// UPDATES
// - APP
ipcMain.handle('verifyVersionApp', (_event) => {
  return verifyVersionApp();
});
ipcMain.handle('installLatestVersionApp', (_event) => {
  return installLatestVersionApp();
});
// - YT-DLP
ipcMain.handle('verifyVersion', (_event) => {
  return verifyVersion();
});
ipcMain.handle('installLatestVersion', (_event) => {
  return installLatestVersion();
});
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

// Obtener la ruta actual de la música
ipcMain.handle('get-music-path', async () => {
  return getMusicPath();
});

// Permitir que el usuario seleccione una nueva ruta y guardarla
ipcMain.handle('set-music-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    setMusicPath(result.filePaths[0]);
    return result.filePaths[0];
  }

  return null;
});

// Restablecer la ruta a la predeterminada
ipcMain.handle('reset-music-path', async () => {
  resetMusicPath();
  return getMusicPath(); // Devolver la ruta predeterminada después de resetear
});

// Seleccionar una carpeta sin guardar la ruta (opcional)
ipcMain.handle('select-music-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null;
});

// Validar si es el directorio default
ipcMain.handle('isDefaultMusicPath', async () => {
  return isDefaultMusicPath();
});

ipcMain.handle("show-restart-dialog", async () => {
  // 🔹 Obtener todas las ventanas abiertas y deshabilitarlas
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => win.setEnabled(false));

  // 🔹 Mostrar el diálogo de reinicio
  const result = await dialog.showMessageBox({
    type: "warning",
    title: "Reinicio Requerido",
    message: "Para aplicar los cambios de directorios, es necesario reiniciar la aplicación.",
    buttons: ["Reiniciar ahora"],
    defaultId: 0,
    noLink: true,
    cancelId: 0, // ❌ No permitir cerrar el diálogo sin reiniciar
  });

  // 🔥 Rehabilitar las ventanas (por si acaso, aunque se cerrará la app)
  allWindows.forEach((win) => win.setEnabled(true));

  if (result.response === 0) {
    app.relaunch();
    app.quit();
  }
});

ipcMain.handle('ytDlpPath', (_event) => {
  return ytDlpPath;
});
ipcMain.handle('ffmpegPath', (_event) => {
  return ffmpegPath;
});

ipcMain.handle('get-platform', () => process.platform);

ipcMain.on('minimize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.minimize();
  }
});

let isMaximized: boolean = false;
ipcMain.handle('maximize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
      isMaximized = false;
    } else {
      focusedWindow.maximize();
      isMaximized = true;
    }
  }
  return isMaximized;
});
ipcMain.handle('isMaximized', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    return focusedWindow.isMaximized();
  }
  return false;
});

ipcMain.on('close', () => {
  app.quit();
});

// PLAYLISTS
ipcMain.handle('playlists', (_event) => {
  return playlists();
});
ipcMain.handle('createPlaylist', (_event, title: string, color: { accent: string, dark: string }, cover: string | undefined) => {
  return createPlaylist(title, color, cover);
});
ipcMain.handle('updatePlaylist', (_event, id: number | undefined, title: string, color: { accent: string, dark: string }, cover: string | undefined) => {
  return updatePlaylist(id, title, color, cover);
});
ipcMain.handle('deletePlaylist', (_event, id: number) => {
  return deletePlaylist(id);
});

// SONGS
ipcMain.handle('download-song', (_event, videoUrl) => {
  console.log('Downloading song:', videoUrl);
  
  return downloadSong(videoUrl);
});
ipcMain.handle('songs', (_event, playlist, song) => {
  return songs(playlist, song);
});
ipcMain.handle('songsXplaylist', (_event, playlistId) => {
  return songsXplaylist(playlistId);
});
ipcMain.handle('getSongById', (_event, id) => {
  return getSongById(id);
});
ipcMain.handle('deleteSong', (_event, id: number) => {
  return deleteSong(id);
});
ipcMain.handle('updateSong', (_event, id: number, title: string, artist: string, image: string | undefined) => {
  return updateSong(id, title, artist, image);
});

// PLAYLIST SONGS
ipcMain.handle('playlistSong', (_event, playlistId: number, songId: number) => {
  return playlistSong(playlistId, songId);
});
ipcMain.handle('addMusicToPlaylist', (_event, playlistId: number, songId: number, date: string) => {
  return addMusicToPlaylist(playlistId, songId, date);
});
ipcMain.handle('deletePlaylistSong', (_event, playlistId: number, songId: number) => {
  return deletePlaylistSong(playlistId, songId);
});

// YOUTUBE
ipcMain.handle('open-new-window', (_event, url: string) => {
  createNewWindow(url);
});
// ipcMain.handle('update-music', (_event, id: number) => {
//   return updateMusic(id);
// });
// ipcMain.handle('delete-music-id', (_event, id: number) => {
//   return deleteMusicById(id);
// });