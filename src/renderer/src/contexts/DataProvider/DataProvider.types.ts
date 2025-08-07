import { PlaylistWithSongs, PlaylistSong, SongFull, Song, Playlist } from "@core/types/data"

export interface PlaylistsContextType {
    // IMPLEMENT YOUR CONTEXT METHODS HERE
    playlists: PlaylistWithSongs[],
    setPlaylists: React.Dispatch<React.SetStateAction<PlaylistWithSongs[]>>
    songs: SongFull[]
    setSongs: React.Dispatch<React.SetStateAction<SongFull[]>>

    playlistSongs: PlaylistSong[]
    setPlaylistSongs: React.Dispatch<React.SetStateAction<PlaylistSong[]>>

    oldData: {
        oldSongs: Song[];
        oldPlaylists: Playlist[];
        oldPlaylistSongs: PlaylistSong[];
    }
    setOldData: React.Dispatch<React.SetStateAction<{
        oldSongs: Song[];
        oldPlaylists: Playlist[];
        oldPlaylistSongs: PlaylistSong[];
    }>>
}