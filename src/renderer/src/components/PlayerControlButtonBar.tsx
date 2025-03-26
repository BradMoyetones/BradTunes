import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerProvider";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { Next, Pause, Play, Prev } from "@/icons/PlayerIcons";
import { Repeat, Repeat1, Shuffle } from "lucide-react";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export function PlayerControlButtonBar() {
  const player = usePlayer();
  const playerManager = usePlayerManager();
  const { isShuffling, loopMode, togglePlay, toggleShuffle, toggleLoopMode } = player;
  const { isFullScreen } = useVideoFullScreen()

  const [isPlaying, setIsPlaying] = useState(!playerManager.audioRef?.paused);

  useEffect(() => {
    const updateState = () => setIsPlaying(!playerManager.audioRef.paused);
    const audio = playerManager.audioRef;

    if (audio) {
      audio.addEventListener("play", updateState);
      audio.addEventListener("pause", updateState);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("play", updateState);
        audio.removeEventListener("pause", updateState);
      }
    };
  }, [playerManager.audioRef]);

  const getRepeatIcon = () => {
    if (loopMode === "song") return <Repeat1 size={16} className="text-primary" />;
    if (loopMode === "playlist") return <Repeat size={16} className="text-primary" />;
    return <Repeat size={16} className="opacity-50" />;
  };

  return (
    <div className={`${isFullScreen && "text-white"} flex justify-center flex-row flex-nowrap items-center gap-4`}>
      <button className="hover:scale-110" title="Toggle Shuffle" onClick={toggleShuffle}>
        <Shuffle size={16} className={isShuffling ? "text-primary" : "opacity-50"} />
      </button>
      <button className={`${isFullScreen && "text-white"} hover:scale-110`} title="Previous song" onClick={() => playerManager.prevSong()}>
        <Prev />
      </button>
      <button className="bg-slate-200 dark:bg-white text-black rounded-full p-2 hover:scale-110" onClick={togglePlay}>
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button className="hover:scale-110" title="Next song" onClick={() => playerManager.nextSong()}>
        <Next />
      </button>
      <button className="hover:scale-110" title="Toggle Loop Mode" onClick={toggleLoopMode}>
        {getRepeatIcon()}
      </button>
    </div>
  );
}
