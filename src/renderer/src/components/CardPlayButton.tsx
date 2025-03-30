import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { usePlayer } from "@/contexts/PlayerProvider";
import { Pause, Play } from "@/icons/PlayerIcons";
import { usePlayerStore } from "@/store/usePlayerStore";
import { PlaylistsFull, SongFull } from "@/types/data";

export function CardPlayButton({ id, song, playlist = null, size = 'small'}: { id?: number, song: SongFull, playlist?: PlaylistsFull | null, size?: 'small' | 'large' }) {
  const { currentSong, currentPlaylist } = usePlayerStore(state => state);
  const playerM = usePlayerManager();
  const { currentMusic } = usePlayer()

  const isPlayingSong = currentSong?.id === id;
  const isPaused = playerM.audioRef.paused;

  const isCurrentSong = (songId: number) => {
    return currentMusic.song?.id === songId && currentMusic.playlist?.id === playlist?.id && !playerM.audioRef.paused
  }

  const iconClassName = {
    small: 'w-4 h-4',
    large: 'w-5 h-5',
  }[size];

  let sanitizedPlaylist: PlaylistsFull | null = null;
  let sanitizedCurrentPlaylist: PlaylistsFull | null = null;

  if (playlist) {
    sanitizedPlaylist = { ...playlist, playlist_songs: [] };
  }
  if (currentPlaylist) {
    sanitizedCurrentPlaylist = { ...currentPlaylist, playlist_songs: [] };
  }

  const shouldShowPause =
    (currentPlaylist === null && isPlayingSong && !isPaused) || 
    (currentPlaylist !== null && !isPaused && JSON.stringify(sanitizedCurrentPlaylist) === JSON.stringify(sanitizedPlaylist)) || 
    (id && isCurrentSong(id));

  return (
    <button
      type="button"
      onClick={() => {
        if(currentPlaylist !== null && currentPlaylist.id === playlist?.id) {
          playerM.togglePlay();
          return;
        }
        playerM.changePlaylistAndSong(sanitizedPlaylist, song);
        
      }}
      className="card-play-button rounded-full text-primary-foreground bg-primary p-4 hover:scale-105 transition hover:bg-primary/90"
    >
      {shouldShowPause ? <Pause className={iconClassName} /> : <Play className={iconClassName} />}
    </button>
  );
}

