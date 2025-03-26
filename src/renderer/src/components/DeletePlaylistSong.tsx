import { PlaylistsFull, SongFull } from "@/types/data";
import ToastNotification from "./ToastNotification";
import { Bug, Trash2 } from "lucide-react";

// Añadir musicas a playlist
const deletePlaylistSong = async (
    song: SongFull, 
    playlist: PlaylistsFull, 
    playlists: PlaylistsFull[],
    songs: SongFull[],
    setSongs: (songs: SongFull[]) => void,
    setPlaylists: (playlists: PlaylistsFull[]) => void
) => {
    if(song && playlist){
        // Mostrar notificación de confirmación
        ToastNotification({
            title: "Confirm Deletion",
            description: `Are you sure you want to delete "${song.title}" of this playlist?`,
            Icon: Trash2,
            label: "Delete",
            onAction: async () => {
                try {
                    // Llamar a la API para eliminar la canción
                    const result = await window.api.deletePlaylistSong(playlist.id, song.id);

                    if (result) {
                        // Notificación de éxito
                        ToastNotification({
                            title: "Music deleted",
                            description: `Song "${song.title}" has been deleted from this playlist.`,
                            Icon: Trash2,
                        });

                        // Eliminar la canción de la playlist correspondiente en el estado
                        const updatedPlaylists = playlists.map(p => {
                            // Verificar si la playlist actual es la que se está modificando
                            if (p.id === playlist.id) {
                                // Eliminar la canción de la lista de canciones de esa playlist
                                const updatedPlaylistSongs = p.playlist_songs.filter(
                                    playlistSong => playlistSong.song.id !== song.id
                                );
                                return {
                                    ...p,
                                    playlist_songs: updatedPlaylistSongs,
                                };
                            }
                            return p;
                        });

                        // Actualizar el estado de playlists
                        setPlaylists(updatedPlaylists);


                        // Ahora actualizar `songs` eliminando la relación de `playlist_songs`
                        const updatedSongs = songs.map(s => {
                            if (s.id === song.id) {
                                // Eliminar la relación de playlist_songs correspondiente a esa canción
                                const updatedPlaylistSongs = s.playlist_songs.filter(
                                    playlistSong => playlistSong.playlist_id !== playlist.id
                                );
                                return {
                                    ...s,
                                    playlist_songs: updatedPlaylistSongs,
                                };
                            }
                            return s;
                        });

                        // Actualizar el estado de `songs`
                        setSongs(updatedSongs);

                    } else {
                        ToastNotification({
                            title: "Error deleting music",
                            description: `Could not delete song "${song.title}" from this playlist.`,
                            Icon: Bug,
                        });
                    }
                } catch (error) {
                    // Manejo de errores
                    if (error instanceof Error) {
                        ToastNotification({
                            title: "Error deleting music",
                            description: error.message,
                            Icon: Bug,
                        });
                    } else {
                        ToastNotification({
                            title: "Error",
                            description: "An unknown error occurred while deleting the song.",
                            Icon: Bug,
                        });
                    }
                }
            },
        });

    }
}

export default deletePlaylistSong;