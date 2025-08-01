import { Song, Playlist, PlaylistWithSongs, PlaylistSong, PlaylistSongFull, SongFull, CurrentMusic } from '@core/types/data'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // UPDATES
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

      // - APP
      getMusicPath: () => Promise<string>;
      setMusicPath: (newPath: string) => void;
      resetMusicPath: () => void;
      selectMusicFolder: () => Promise<string | null>;
      isDefaultMusicPath: () => boolean;

      showRestartDialog: () => Promise<void>;

      getAppVersion: () => Promise<string>

      ytDlpPath: () => Promise<string>
      ffmpegPath: () => Promise<string>

      getPlatform: () => Promise<string>;

      minimize: () => void;
      maximize: () => Promise<boolean>;
      isMaximized: () => Promise<boolean>;
      close: () => void;

      // Basic SQL Querys
      playlists: () => Promise<PlaylistWithSongs[]>
      songs: () => Promise<SongFull[]>
      playlistSongs: () => Promise<PlaylistSong[]>
      
      createPlaylist: (title: string, color: { accent: string, dark: string }, cover: string | undefined | null) => Promise<PlaylistsFull>
      updatePlaylist: (id: number | undefined, title: string, color: { accent: string, dark: string }, cover: string | undefined | null) => Promise<PlaylistsFull>
      deletePlaylist: (id: number) => Promise<boolean>
      
      downloadSong: (url: string) => Promise<SongFull>
      downloadMedia: (filePath: string) => Promise<{ success: boolean; buffer?: Buffer; filename?: string; error?: string }>;
      songsXplaylist: (playlistId: number) => Promise<SongFull[]>
      getSongById: (id: number) => Promise<SongFull | null> 
      deleteSong: (id: number) => Promise<boolean>
      updateSong: (id: number, title: string, artist: string, image: string | undefined) => Promise<SongFull>

      playlistSong: (playlistId: number, songId: number) => Promise<PlaylistSongs | false>
      addMusicToPlaylist: (playlistId: number, songId: number, date: string) => Promise<PlaylistSongFull>
      deletePlaylistSong: (playlistId: number, songId: number) => Promise<boolean>

      createNewWindow: (url: string) => Promise<void>
    }
  }
}
