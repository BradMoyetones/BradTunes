import { useState, useEffect } from "react";
import { Next, Pause, Play, Prev } from "@/icons/PlayerIcons";
import { Repeat, Repeat1, Shuffle } from "lucide-react";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { usePlayerStore } from "@/store";
import { usePlayerController } from "@/contexts";

export function PlayerControlButtonBar() {
  const {playbackMode, isShuffle, currentSong, currentPlaylist} = usePlayerStore();
  const { playNext, playPrevious, toggleLoopMode, togglePlay, toggleShuffle, isPlaying } = usePlayerController();
  const { isFullScreen } = useVideoFullScreen()

  const getRepeatIcon = () => {
    if (playbackMode === "repeat-one") return <Repeat1 size={16} className="text-primary" />;
    if (playbackMode === "repeat-all") return <Repeat size={16} className="text-primary" />;
    return <Repeat size={16} className="opacity-50" />;
  };

  return (
    <div className={`${isFullScreen && "text-white"} flex justify-center flex-row flex-nowrap items-center gap-4`}>
      <button className="hover:scale-110" title="Toggle Shuffle" onClick={toggleShuffle}>
        <Shuffle size={16} className={isShuffle ? "text-primary" : "opacity-50"} />
      </button>
      <button className={`${isFullScreen && "text-white"} hover:scale-110`} title="Previous song" onClick={() => playPrevious()}>
        <Prev />
      </button>
      <button className="bg-slate-200 dark:bg-white text-black rounded-full p-2 hover:scale-110" onClick={togglePlay}>
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button className="hover:scale-110" title="Next song" onClick={() => playNext()}>
        <Next />
      </button>
      <button className="hover:scale-110" title="Toggle Loop Mode" onClick={toggleLoopMode}>
        {getRepeatIcon()}
      </button>
    </div>
  );
}
