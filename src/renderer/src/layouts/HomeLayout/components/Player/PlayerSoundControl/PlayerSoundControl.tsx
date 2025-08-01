import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/store";
import { formatTime } from "@/utils/time";
import { usePlayerController } from "@/contexts";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export const PlayerSoundControl = () => {
  const { currentTime, duration } = usePlayerStore();
const { audioRef } = usePlayerController();

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isFullScreen } = useVideoFullScreen();


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
            updateTooltip(newTime); // actualiza tooltip mientras arrastra
          }}
          onValueCommit={(value) => {
            const [newTime] = value;
            setIsDragging(false);
            setHoverTime(null);

            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
            }

            // También actualiza el tiempo actual en el store
            usePlayerStore.setState({ currentTime: newTime });
          }}
        />
      </div>

      <span className="opacity-50 w-12">{formatTime(duration)}</span>
    </div>
  );
};
