import { getTimestamp } from "@/lib/helpers";
import { PlaylistsFull, PlaylistSongsFull, SongFull } from "@/types/data";
import ToastNotification from "./ToastNotification";
import { Bug, Check, X } from "lucide-react";
import { CurrentMusic } from "@/utils/PlayerManager";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

// Añadir musicas a playlist
const addMusicToPlaylist = async (
    song: SongFull, 
    playlist: PlaylistsFull, 
    currentMusic: CurrentMusic, 
    setCurrentMusic: (currentMusic: CurrentMusic) => void, 
    setPlaylists: SetState<PlaylistsFull[]>,
    setSongs: SetState<SongFull[]>,
    addSongToPlaylist?: (songId: number, data: PlaylistSongsFull) => void
    
) => {
    const date = getTimestamp();

    if (song && playlist) {
        try {
            const playlistSong = await window.api.playlistSong(playlist.id, song.id);

            if (playlistSong) {
                ToastNotification({
                    title: "Music Added",
                    description: `Music already added to ${playlist.title}`,
                    Icon: X,
                });
            } else {
                // Agregar la canción a la playlist en la base de datos
                const createPlaylistSong = await window.api.addMusicToPlaylist(playlist.id, song.id, date);

                if (createPlaylistSong) {
                    // 🔄 Actualizar la canción en el array `songs` dentro de `currentMusic`
                    const updatedSongs = currentMusic.songs.map(s =>
                        s.id === song.id
                            ? { ...s, playlist_songs: [...s.playlist_songs, createPlaylistSong] }
                            : s
                    );
                    
                    if (addSongToPlaylist) {
                        addSongToPlaylist(song.id, createPlaylistSong);
                    }

                    // 🔄 Actualizar `currentMusic`
                    setCurrentMusic({
                        ...currentMusic,
                        songs: updatedSongs,
                        song: currentMusic.song?.id === song.id 
                            ? { ...currentMusic.song, playlist_songs: [...currentMusic.song.playlist_songs, createPlaylistSong] }
                            : currentMusic.song
                    });

                    setSongs(prevSongs =>
                        prevSongs.map(s =>
                            s.id === song.id
                                ? { ...s, playlist_songs: [...s.playlist_songs, createPlaylistSong] }
                                : s
                        )
                    );
                    
                    setPlaylists(prevPlaylists =>
                        prevPlaylists.map(p => 
                            p.id === playlist.id 
                                ? { ...p, playlist_songs: [...p.playlist_songs, createPlaylistSong] }
                                : p
                        )
                    );                    

                    ToastNotification({
                        title: "Music Added",
                        description: `Music has been added to ${playlist.title}`,
                        Icon: Check,
                    });
                }
            }
        } catch (error) {
            ToastNotification({
                title: "Error adding music",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                Icon: Bug,
            });
        }
    }
};


export default addMusicToPlaylist;