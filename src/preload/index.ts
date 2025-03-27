import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Playlist, SongFull } from '../types/data'

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

  // PLAYLISTS
  playlists: () => ipcRenderer.invoke('playlists'),
  createPlaylist: (title: string, color: string, cover: string | undefined) => ipcRenderer.invoke('createPlaylist', title, color, cover),
  updatePlaylist: (id: number | undefined, title: string, color: string, cover: string | undefined) => ipcRenderer.invoke('updatePlaylist', id, title, color, cover),
  deletePlaylist: (id: number) => ipcRenderer.invoke('deletePlaylist', id),
  
  // SONGS
  downloadSong: (url: string) => ipcRenderer.invoke('download-song', url),
  songs: (currentPlaylist: Playlist | null, currentSong: SongFull | null) => ipcRenderer.invoke('songs', currentPlaylist, currentSong),
  songsXplaylist: (playlistId: number) => ipcRenderer.invoke('songsXplaylist', playlistId),
  getSongById: (id: number) => ipcRenderer.invoke('getSongById', id),
  deleteSong: (id: number) => ipcRenderer.invoke('deleteSong', id),
  updateSong: (id: number, title: string, artist: string, image: string | undefined) => ipcRenderer.invoke('updateSong', id, title, artist, image),

  // PLAYLIST SONGS
  playlistSong: (playlistId: number, songId: number) => ipcRenderer.invoke('playlistSong', playlistId, songId),
  addMusicToPlaylist: (playlistId: string, songId: string, date: string) => ipcRenderer.invoke('addMusicToPlaylist', playlistId, songId, date),
  deletePlaylistSong: (playlistId: number, songId: number) => ipcRenderer.invoke('deletePlaylistSong', playlistId, songId),

  // YOUTUBE
  createNewWindow: (url: string) => ipcRenderer.invoke('open-new-window', url),
}

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
