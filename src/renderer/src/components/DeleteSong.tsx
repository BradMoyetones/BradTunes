import { PlaylistsFull, SongFull } from "@/types/data";
import ToastNotification from "./ToastNotification";
import { Bug, Trash2 } from "lucide-react";
import { CurrentMusic } from "@/utils/PlayerManager";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

// Eliminar canción
const deleteSong = async (
    song: SongFull, 
    currentMusic: CurrentMusic,
    setCurrentMusic: (currentMusic: CurrentMusic) => void, 
    setPlaylists: SetState<PlaylistsFull[]>,
    setSongs: SetState<SongFull[]>
): Promise<void> => {
    if (!song) return;

    // Mostrar notificación de confirmación
    ToastNotification({
        title: "Confirm Deletion",
        description: `Are you sure you want to delete "${song.title}"?`,
        Icon: Trash2,
        label: "Delete",
        onAction: async () => {
            try {
                // Llamar a la API para eliminar la canción
                const result = await window.api.deleteSong(song.id);

                if (result) {
                    // Notificación de éxito
                    ToastNotification({
                        title: "Music deleted",
                        description: `Song "${song.title}" has been deleted from the database.`,
                        Icon: Trash2,
                    });

                    // 🔄 Actualizar `songs` eliminando la canción
                    setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));

                    // 🔄 Actualizar `playlists` eliminando la canción
                    setPlaylists(prevPlaylists =>
                        prevPlaylists.map(p => ({
                            ...p,
                            playlist_songs: p.playlist_songs.filter(playlistSong => playlistSong.song.id !== song.id),
                        }))
                    );

                    // 🔄 Actualizar `currentMusic` eliminando la canción
                    setCurrentMusic({
                        ...currentMusic,
                        songs: currentMusic.songs.filter(s => s.id !== song.id),
                        song: currentMusic.song?.id === song.id ? null : currentMusic.song
                    });

                } else {
                    ToastNotification({
                        title: "Error deleting music",
                        description: `Could not delete song "${song.title}" from the database.`,
                        Icon: Bug,
                    });
                }
            } catch (error) {
                // Manejo de errores
                ToastNotification({
                    title: "Error deleting music",
                    description: error instanceof Error ? error.message : "An unknown error occurred while deleting the song.",
                    Icon: Bug,
                });
            }
        },
    });
};

export default deleteSong;
