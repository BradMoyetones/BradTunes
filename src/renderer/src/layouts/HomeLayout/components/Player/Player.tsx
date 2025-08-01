import { usePlayerStore } from "@/store";
import { PlayerControlButtonBar } from "./PlayerControlButtonBar/PlayerControlButtonBar";
import { PlayerCurrentSong } from "./PlayerCurrentSong/PlayerCurrentSong";
import { PlayerSoundControl } from "./PlayerSoundControl/PlayerSoundControl";
import { usePlayerController } from "@/contexts";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export default function Player() {
    const {currentSong} = usePlayerStore();
    const {audioRef} = usePlayerController();
    const { isFullScreen, isButtonVisible } = useVideoFullScreen();

    return (
        <div className={`flex flex-row p-2 items-center justify-between w-full h-full z-50 transition-all duration-300 ${isFullScreen ? isButtonVisible ? "opacity-100 [background:radial-gradient(115%_115%_at_50%_10%,#ffffff00_40%,#000_100%)] player-shadow" : "opacity-0" : ""}`}>
            <div className="max-w-[300px] w-full">
                <PlayerCurrentSong {...currentSong} />
            </div>

            <div className="grid place-content-center gap-4 flex-1">
                <div className="flex justify-center flex-col items-center">
                    <PlayerControlButtonBar />
                    <PlayerSoundControl />
                    <audio
                        ref={audioRef}
                    />
                </div>
            </div>

            <div className="place-content-center max-w-[300px] w-full flex justify-end items-center gap-4">
                {/* <PlayerMaximizeControl />
                <PlayerDevicesControl />
                <PlayerVolumeControl /> */}
            </div>
        </div>
    );
}
