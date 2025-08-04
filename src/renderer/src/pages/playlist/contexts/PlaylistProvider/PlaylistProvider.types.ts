import { PlaylistWithSongs, SongFull } from "@core/types/data";

export interface PlaylistProviderProps {
    playlistId: string | undefined,
    loading: boolean,
    artistsString: string,
    playlist: PlaylistWithSongs,
    horasTotales: string,
    songs: SongFull[]
}