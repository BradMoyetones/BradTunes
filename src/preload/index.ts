import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Playlist, PlaylistSong, PlaylistWithSongs, Song } from '@core/types/data'

// Custom APIs for renderer
const api = {
  // UPDATES
  // - APP
  verifyVersionApp: () => ipcRenderer.invoke('verifyVersionApp'),
  installLatestVersionApp: () => ipcRenderer.invoke('installLatestVersionApp'),

  // - YT-DLP
  verifyVersion: () => ipcRenderer.invoke('verifyVersion'),
  installLatestVersion: () => ipcRenderer.invoke('installLatestVersion'),

  getMusicPath: () => ipcRenderer.invoke('get-music-path'),
  setMusicPath: () => ipcRenderer.invoke('set-music-path'),
  resetMusicPath: () => ipcRenderer.invoke('reset-music-path'),
  selectMusicFolder: () => ipcRenderer.invoke('select-music-folder'),
  isDefaultMusicPath: () => ipcRenderer.invoke('isDefaultMusicPath'),

  showRestartDialog: () => ipcRenderer.invoke("show-restart-dialog"),

  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  ytDlpPath: () => ipcRenderer.invoke("ytDlpPath"),
  ffmpegPath: () => ipcRenderer.invoke("ffmpegPath"),

  getPlatform: () => ipcRenderer.invoke("get-platform"),

  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  isMaximized: () => ipcRenderer.invoke("isMaximized"),
  close: () => ipcRenderer.send("close"),
  onMaximizeChanged: (callback: (isMax: boolean) => void) => {
    ipcRenderer.on("maximize-changed", (_, value) => callback(value));
  },

  playlists: (): Promise<PlaylistWithSongs[]> => ipcRenderer.invoke('playlists'),
  songs: () => ipcRenderer.invoke('songs'),
  playlistSongs: () => ipcRenderer.invoke('playlistSongs'),

  // Restore music and playlists in new update
  restoreBackup: (data: {
    songs: {
        id: number;
    }[];
    playlists: {
        id: number;
    }[];
    playlistSongs: {
        id: number;
    }[];
  }): Promise<boolean> => ipcRenderer.invoke('restoreBackup', data),

  // PLAYLISTS
  createPlaylist: (title: string, cover: string | undefined) => ipcRenderer.invoke('createPlaylist', title, cover),
  updatePlaylist: (id: number | undefined, title: string, cover: string | undefined) => ipcRenderer.invoke('updatePlaylist', id, title, cover),
  deletePlaylist: (id: number) => ipcRenderer.invoke('deletePlaylist', id),
  
  // SONGS
  downloadSong: (url: string) => ipcRenderer.invoke('download-song', url),
  downloadMedia: (url: string) => ipcRenderer.invoke('download-media', url),
  songsXplaylist: (playlistId: string | undefined) => ipcRenderer.invoke('songsXplaylist', playlistId),
  getSongById: (id: number) => ipcRenderer.invoke('getSongById', id),
  deleteSong: (id: number) => ipcRenderer.invoke('deleteSong', id),
  updateSong: (id: number, title: string, artist: string, image: string | undefined) => ipcRenderer.invoke('updateSong', id, title, artist, image),

  // PLAYLIST SONGS
  playlistSong: (playlistId: number, songId: number) => ipcRenderer.invoke('playlistSong', playlistId, songId),
  addMusicToPlaylist: (playlistId: string, songId: string) => ipcRenderer.invoke('addMusicToPlaylist', playlistId, songId),
  deletePlaylistSong: (playlistId: number, songId: number) => ipcRenderer.invoke('deletePlaylistSong', playlistId, songId),

  // YOUTUBE
  createNewWindow: (url: string) => ipcRenderer.invoke('open-new-window', url),

  // Data of old database
  getOldDataAll: (): Promise<{
    oldSongs: Song[],
    oldPlaylists: Playlist[],
    oldPlaylistSongs: PlaylistSong[]
  }> => ipcRenderer.invoke('getOldDataAll')
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
