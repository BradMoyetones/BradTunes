import { Song } from '@/data'
import { Playlist, PlaylistsFull, PlaylistSongs, PlaylistSongsFull, SongFull, CurrentMusic } from '@/types/data'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // UPDATES

      // - APP
      verifyVersionApp: () => Promise<{
        currentVersion: string;
        newVersion: string | null;
        message: string;
      }>
      installLatestVersionApp: () => Promise<{
        currentVersion: string;
        newVersion: string | null;
        message: string;
      }>

      // - YT-DLP
      verifyVersion: () => Promise<{
        currentVersion: string;
        newVersion: string | null;
        message: string;
      }>
      installLatestVersion: () => Promise<{
        currentVersion: string;
        newVersion: string | null;
        message: string;
      }>

      getAppVersion: () => Promise<string>


      playlists: () => Promise<PlaylistsFull[]>
      createPlaylist: (title: string, color: { accent: string, dark: string }, cover: string | undefined | null) => Promise<PlaylistsFull>
      updatePlaylist: (id: number | undefined, title: string, color: { accent: string, dark: string }, cover: string | undefined | null) => Promise<PlaylistsFull>
      deletePlaylist: (id: number) => Promise<boolean>
      
      downloadSong: (url: string) => Promise<SongFull>
      songs: (currentPlaylist: Playlist | null, currentSong: Song | null) => Promise<CurrentMusic>
      songsXplaylist: (playlistId: number) => Promise<SongFull[]>
      getSongById: (id: number) => Promise<SongFull | null> 
      deleteSong: (id: number) => Promise<boolean>
      updateSong: (id: number, title: string, artist: string, image: string | undefined) => Promise<SongFull>

      playlistSong: (playlistId: number, songId: number) => Promise<PlaylistSongs | false>
      addMusicToPlaylist: (playlistId: number, songId: number, date: string) => Promise<PlaylistSongsFull>
      deletePlaylistSong: (playlistId: number, songId: number) => Promise<boolean>

      createNewWindow: (url: string) => Promise<void>
    }
  }
}
