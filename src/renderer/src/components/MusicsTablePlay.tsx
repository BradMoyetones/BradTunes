import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { PlaylistsFull, SongFull } from "@/types/data";
import { Pause, Play } from "lucide-react";

interface Props {
  song: SongFull;
  playlist: PlaylistsFull;
  isCurrentSong: boolean;
}

export const MusicsTablePlay = ({ song, playlist, isCurrentSong }: Props) => {
  const player = usePlayerManager()
  return (
    <button 
      className="text-zinc-900 dark:text-white flex items-center justify-center" 
      onClick={() => {
        const sanitizedPlaylist = { ...playlist, playlist_songs: [] }; // 🔥 Eliminar playlist_songs
        player.changePlaylistAndSong(sanitizedPlaylist, song);
      }}
    >
      {isCurrentSong ? (
        <Pause className={"hover:scale-125 transition-transform"} />
      ) : ( 
        <Play className={"hover:scale-125 transition-transform"} />
      )}
    </button>
  );
};
