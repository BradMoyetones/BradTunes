import { PlaylistWithSongs, SongFull } from "@core/types/data";
import { toast } from "sonner";

type reciveProps = {
  song: SongFull, 
  playlist: PlaylistWithSongs
}

type reciveHookProps = {
  playlists: PlaylistWithSongs[],
  songs: SongFull[],
  setSongs: React.Dispatch<React.SetStateAction<SongFull[]>>,
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistWithSongs[]>>
}

// Hook para añadir música a la lista de reproducción
const usePlaylistMusicActions = (
  {
    playlists,
    setPlaylists,
    setSongs,
    songs
  }: reciveHookProps
) => {
  const addMusicToPlaylist = async ({song, playlist}: reciveProps) => {
    if (song && playlist) {
      try {
        const playlistSong = await window.api.playlistSong(playlist.id, song.id);

        if (playlistSong) {
          toast.info(`Music already added to ${playlist.title}`);
        } else {
          // Agregar la canción a la playlist
          const createPlaylistSong = await window.api.addMusicToPlaylist(playlist.id, song.id);
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

            toast.success(`Music has been added to ${playlist.title}`);
          }
        }
      } catch (error) {
        console.log(error);
        
        if (error instanceof Error) {
          toast.error("Error adding music");
        } else {
          toast.error("Error: An unknown error occurred");
        }
      }
    }
  };

  const removeMusicFromPlaylist = ({song, playlist}: reciveProps) => {
    toast(`Remove "${song.title}" from ${playlist.title}?`, {
      action: {
        label: "Remove",
        onClick: () => {
          toast.promise(
            window.api.deletePlaylistSong(playlist.id, song.id),
            {
              loading: "Removing song...",
              success: (success) => {
                if (!success) throw new Error("Failed");

                // Actualizar songs
                const updatedSongs = songs.map(s => {
                  if (s.id === song.id) {
                    return {
                      ...s,
                      playlist_songs: s.playlist_songs.filter(ps => ps.playlistId !== playlist.id),
                    };
                  }
                  return s;
                });
                setSongs(updatedSongs);

                // Actualizar playlists
                const updatedPlaylists = playlists.map(p => {
                  if (p.id === playlist.id) {
                    return {
                      ...p,
                      playlist_songs: p.playlist_songs.filter(ps => ps.songId !== song.id),
                    };
                  }
                  return p;
                });
                setPlaylists(updatedPlaylists);

                return `Removed from ${playlist.title}`;
              },
              error: "Failed to remove song",
            }
          );
        },
      },
    });
  };

  const deleteMusic = ({song}: {song: SongFull}) => {
    toast(`Are you sure you want to delete "${song.title}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          toast.promise(
            window.api.deleteSong(song.id),
            {
              loading: "Deleting song...",
              success: (success) => {
                if (!success) throw new Error("Failed");

                // Actualizar el estado eliminando la canción
                const updatedSongs = songs.filter(s => s.id !== song.id);
                setSongs(updatedSongs);

                return `"${song.title}" deleted successfully`;
              },
              error: (e) => {
                console.log(e);
                return ""
              },

            }
          );
        },
      },
    });
  };

  return { addMusicToPlaylist, removeMusicFromPlaylist, deleteMusic}
};

export default usePlaylistMusicActions;
