import { usePlayer } from "@/contexts/PlayerProvider";
import { PlayerVolumeIconComponent } from "./PlayerVolumeIconComponent";
import { Slider } from "./ui/slider";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export const PlayerVolumeControl = () => {
  const {isFullScreen} = useVideoFullScreen()
  const { volume, setVolume } = usePlayer();

  const handleClickVolumen = () => {
    setVolume(volume > 0 ? 0 : 1); // Si el volumen es mayor a 0, mutea; si está en 0, lo sube a 100%
  };

  return (
    <div className={`flex justify-center gap-x-2 ${isFullScreen && "text-white"}`}>
      <button className="opacity-50 hover:opacity-100 transition-all" onClick={handleClickVolumen}>
        <PlayerVolumeIconComponent />
      </button>

      <Slider
        max={100}
        min={0}
        value={[volume * 100]} // Convierte de 0-1 a 0-100
        className="w-[95px]"
        onValueChange={(value) => {
          const [newVolume] = value;
          setVolume(newVolume / 100); // Convierte de 0-100 a 0-1
        }}
      />
    </div>
  );
};
