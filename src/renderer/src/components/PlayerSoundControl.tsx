import { useEffect, useState, useRef } from "react";
import { Slider } from "./ui/slider";
import { usePlayerStore } from "@/store/usePlayerStore";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { usePlayer } from "@/contexts/PlayerProvider";

export const PlayerSoundControl = () => {
  const playerM = usePlayerManager();
  const player = usePlayer();
  const { currentTime, currentSong } = usePlayerStore((state) => state);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lastUpdateTime = useRef(0); // 🟢 Evita actualizaciones constantes
  const { isFullScreen } = useVideoFullScreen();

  // Convierte "0:00" a segundos
  const parseDuration = (durationStr: string): number => {
    const [minutes, seconds] = durationStr.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    if (!playerM || !playerM.audioRef) return;

    const audio = playerM.audioRef;

    if (currentSong?.duration) {
      setDuration(parseDuration(currentSong.duration));
    }

    if (currentTime > 0) {
      audio.currentTime = currentTime;
    }

    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (!isDragging && now - lastUpdateTime.current > 500) {
        lastUpdateTime.current = now;
        usePlayerStore.setState({ currentTime: audio.currentTime });
      }
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [playerM, isDragging, currentSong?.duration, player.isPlaying]);

  console.log(player.isPlaying);
  
  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const updateTooltip = (eventOrValue: React.MouseEvent<HTMLDivElement> | number) => {
    if (!sliderRef.current || duration === 0) return;

    let newTime: number;
    let offsetX: number;

    if (typeof eventOrValue === "number") {
      newTime = eventOrValue;
      offsetX = (newTime / duration) * sliderRef.current.clientWidth;
    } else {
      const rect = sliderRef.current.getBoundingClientRect();
      offsetX = eventOrValue.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
      newTime = percentage * duration;
    }

    setHoverTime(newTime);
    setTooltipPosition(offsetX);
  };

  return (
    <div className={`flex items-center gap-x-3 text-xs pt-2 relative ${isFullScreen && "text-white"}`}>
      <span className="opacity-50 w-12 text-right">{formatTime(currentTime)}</span>

      <div
        ref={sliderRef}
        className="relative w-[400px]"
        onMouseMove={updateTooltip}
        onMouseLeave={() => !isDragging && setHoverTime(null)}
      >
        {hoverTime !== null && (
          <div
            className="absolute bottom-8 px-2 py-1 text-xs text-white bg-black/80 rounded-md pointer-events-none"
            style={{ left: `${tooltipPosition}px`, transform: "translateX(-50%)" }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        <Slider
          value={[currentTime]}
          max={duration}
          min={0}
          className="w-full"
          onValueChange={(value) => {
            const [newTime] = value;
            setIsDragging(true);
            updateTooltip(newTime);
            usePlayerStore.setState({ currentTime: newTime });
          }}
          onValueCommit={(value) => {
            const [newTime] = value;
            setIsDragging(false);
            setHoverTime(null);
            if (playerM.audioRef) {
              playerM.audioRef.currentTime = newTime;
            }
            playerM.stopSeeking(newTime);
          }}
        />
      </div>

      <span className="opacity-50 w-12">{formatTime(duration)}</span>
    </div>
  );
};
