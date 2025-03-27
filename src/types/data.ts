import { colors } from "../lib/colors";


export interface Playlist {
    id: number;
    title: string;
    color: (typeof colors)[keyof typeof colors];
    cover: string;
    date: string;
}

export interface Song {
    id: number;
    title: string;
    artist: string;
    song: string;
    video: string | null;
    image: string;
    reproductions: number;
    duration: string;
    date: string;
}

export interface SongFull extends Song {
    playlist_songs: PlaylistSongs[];
}

export interface PlaylistSongs {
    id: number;
    playlist_id: number;
    song_id: number;
    date: string;
}

export interface PlaylistSongsFull extends PlaylistSongs {
    song: Song;
    playlist: Playlist;
}

export interface PlaylistsFull extends Playlist {
    playlist_songs: PlaylistSongsFull[];
}

export interface CurrentMusic {
    playlist: Playlist | null; // Playlist actual (si existe)
    song: SongFull | null; // Canción en reproducción
    songs: SongFull[]; // Canciones de la playlist
}
