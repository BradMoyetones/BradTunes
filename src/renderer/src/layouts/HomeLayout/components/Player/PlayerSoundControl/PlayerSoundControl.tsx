import { useState, useRef, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/store";
import { formatTime } from "@/utils/time";
import { usePlayerController } from "@/contexts";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export const PlayerSoundControl = () => {
  const { currentSong, currentTime } = usePlayerStore();
  const { howlRef, setSeekAndSync } = usePlayerController();
  const { isFullScreen } = useVideoFullScreen();

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const updateTooltip = (eventOrValue: React.MouseEvent<HTMLDivElement> | number) => {
    if (!howlRef.current || !sliderRef.current || howlRef.current?.duration() === 0) return;

    let newTime: number;
    let offsetX: number;

    if (typeof eventOrValue === "number") {
      newTime = eventOrValue;
      offsetX = (newTime / howlRef.current.duration()) * sliderRef.current.clientWidth;
    } else {
      const rect = sliderRef.current.getBoundingClientRect();
      offsetX = eventOrValue.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
      newTime = percentage * howlRef.current.duration();
    }

    setHoverTime(newTime);
    setTooltipPosition(offsetX);
  };

  const duration = useMemo(() => {
    if(!currentSong) return 0
    return Number(currentSong.duration)
  }, [currentSong])

  return (
    <div className={`flex items-center gap-x-3 text-xs pt-2 relative ${isFullScreen && "text-white"}`}>
      <span className="opacity-50 w-12 text-right">{formatTime(currentTime)}</span>

      <div
        ref={sliderRef}
        className="relative w-[400px]"
        onMouseMove={updateTooltip}
        onMouseLeave={() => {
          if (!isDragging) {
            setHoverTime(null);
          }
        }}
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
          value={[isDragging ? (hoverTime ?? currentTime) : currentTime]}
          max={duration}
          min={0}
          className="w-full"
          onValueChange={(value) => {
            const [newTime] = value;
            setIsDragging(true);
            updateTooltip(newTime);
          }}
          onValueCommit={(value) => {
            setIsDragging(false);
            const [newTime] = value;
            setSeekAndSync(newTime); // Forzamos sincronización visual
            setHoverTime(null);
          }}
        />
      </div>

      <span className="opacity-50 w-12">{formatTime(duration)}</span>
    </div>
  );
};
