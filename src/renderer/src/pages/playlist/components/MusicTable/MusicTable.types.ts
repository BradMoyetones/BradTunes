import { PlaylistWithSongs, SongFull } from "@core/types/data";

export interface MusicTableProps {
    songs: SongFull[];
    playlist: PlaylistWithSongs
}