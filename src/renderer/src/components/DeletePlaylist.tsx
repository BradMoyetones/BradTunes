import { PlaylistsFull } from "@/types/data";
import ToastNotification from "./ToastNotification";
import { Bug, Trash2 } from "lucide-react";

const deletePlaylist = async (
    playlist: PlaylistsFull, 
    playlists: PlaylistsFull[],
    setPlaylists: (playlists: PlaylistsFull[]) => void
) => {
    if(playlist){
        // Mostrar notificación de confirmación
        ToastNotification({
            title: "Confirm Deletion",
            description: `Are you sure you want to delete "${playlist.title}"?`,
            Icon: Trash2,
            label: "Delete",
            onAction: async () => {
                try {
                    // Llamar a la API para eliminar la canción
                    const result = await window.api.deletePlaylist(playlist.id);

                    if (result) {
                        // Notificación de éxito
                        ToastNotification({
                            title: "Playlist deleted",
                            description: `Playlist "${playlist.title}" has been deleted from the database.`,
                            Icon: Trash2,
                        });

                        // Eliminar playlist del estado de `playlists` medieante el playlist.id
                        const updatedPlaylists = playlists.filter(p => p.id !== playlist.id);

                        // Actualizar el estado de playlists
                        setPlaylists(updatedPlaylists);

                    } else {
                        ToastNotification({
                            title: "Error deleting playlist",
                            description: `Could not delete playlist "${playlist.title}" from the database.`,
                            Icon: Bug,
                        });
                    }
                } catch (error) {
                    // Manejo de errores
                    if (error instanceof Error) {
                        ToastNotification({
                            title: "Error deleting playlist",
                            description: error.message,
                            Icon: Bug,
                        });
                    } else {
                        ToastNotification({
                            title: "Error",
                            description: "An unknown error occurred while deleting the playlist.",
                            Icon: Bug,
                        });
                    }
                }
            },
        });

    }
}

export default deletePlaylist;