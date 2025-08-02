import { Slider } from "@/components/ui/slider";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { usePlayerController } from "@/contexts";
import { PlayerVolumeIconComponent } from "../PlayerVolumeIconComponent/PlayerVolumeIconComponent";
import { usePlayerStore } from "@/store";

export const PlayerVolumeControl = () => {
  const { isFullScreen } = useVideoFullScreen();
  const { setVolumeAndSync } = usePlayerController();
  const { volume } = usePlayerStore();

  const handleClickVolumen = () => {
    const newVol = volume > 0 ? 0 : 1;
    setVolumeAndSync(newVol);
  };

  const handleVolumeChange = (value: number[]) => {
    const [newVolPercent] = value;
    setVolumeAndSync(newVolPercent / 100);
  };

  return (
    <div className={`flex justify-center gap-x-2 ${isFullScreen ? "text-white" : ""}`}>
      <button className="opacity-50 hover:opacity-100 transition-all" onClick={handleClickVolumen}>
        <PlayerVolumeIconComponent />
      </button>

      <Slider
        max={100}
        min={0}
        value={[volume * 100]}
        className="w-[95px]"
        onValueChange={handleVolumeChange}
      />
    </div>
  );
};
