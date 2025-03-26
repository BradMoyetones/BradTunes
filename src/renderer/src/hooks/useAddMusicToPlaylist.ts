import ToastNotification from "@/components/ToastNotification";
import { getTimestamp } from "@/lib/helpers";
import { PlaylistsFull, SongFull } from "@/types/data";
import { Bug, Check, X } from "lucide-react";

// Hook para añadir música a la lista de reproducción
const useAddMusicToPlaylist = (
  playlists: PlaylistsFull[],
  songs: SongFull[],
  setSongs: (songs: SongFull[]) => void,
  setPlaylists: (playlists: PlaylistsFull[]) => void
) => {
  const addMusicToPlaylist = async (song: SongFull, playlist: PlaylistsFull) => {
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
          // Agregar la canción a la playlist
          const createPlaylistSong = await window.api.addMusicToPlaylist(playlist.id, song.id, date);
          if (createPlaylistSong) {
            // Actualizar la canción en el array de `songs`
            const updatedSongs = songs.map(s => {
              if (s.id === song.id) {
                return {
                  ...s,
                  playlist_songs: [...s.playlist_songs, createPlaylistSong], // Agregar la canción a `playlist_songs`
                };
              }
              return s;
            });

            // Actualizar el estado de canciones
            setSongs(updatedSongs);

            // Obtener la playlist actualizada
            const updatedPlaylists = playlists.map(p => {
              if (p.id === playlist.id) {
                return {
                  ...p,
                  playlist_songs: [...p.playlist_songs, createPlaylistSong], // Añadir la nueva canción a la lista
                };
              }
              return p; // No modificar las demás playlists
            });

            // Actualizar el estado de playlists
            setPlaylists(updatedPlaylists);

            ToastNotification({
              title: "Music Added",
              description: `Music has been added to ${playlist.title}`,
              Icon: Check,
            });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          ToastNotification({
            title: "Error adding music",
            description: error.message,
            Icon: Bug,
          });
        } else {
          ToastNotification({
            title: "Error",
            description: "Error: An unknown error occurred",
            Icon: Bug,
          });
        }
      }
    }
  };

  return addMusicToPlaylist;
};

export default useAddMusicToPlaylist;
