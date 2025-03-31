import { useEffect, useRef } from "react";
import { PlayerControlButtonBar } from "./PlayerControlButtonBar";
import { PlayerCurrentSong } from "./PlayerCurrentSong";
import { PlayerSoundControl } from "./PlayerSoundControl";
import { PlayerVolumeControl } from "./PlayerVolumeControl";
import PlayerDevicesControl from "./PlayerDevicesControl";
import { usePlayer } from "@/contexts/PlayerProvider";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { usePlayerStore } from "@/store/usePlayerStore";
import PlayerMaximizeControl from "./PlayerMaximizeControl";
import { useMusicPath } from "@/contexts/MusicPathProvider";

export default function Player() {
    const playerStore = usePlayerStore();
    const player = usePlayer();
    const playerManager = usePlayerManager();
    const { isFullScreen, isButtonVisible } = useVideoFullScreen();
    const { musicPath } = useMusicPath();

    // 🔥 Creamos una referencia de React para el audio
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Asegurar que PlayerManager usa la referencia correcta
    useEffect(() => {
        if (audioRef.current && playerManager.audioRef && player.currentMusic.song) {
            // AUDIO
            playerManager.setAudioElement(audioRef.current);
            playerManager.audioRef.src = `safe-file://${musicPath}/${player.currentMusic.song.song}`
            playerManager.audioRef.currentTime = player.currentTime; // Opcional: resetear el tiempo al cambiar la canción
            playerManager.audioRef.volume = player.volume
        }
    }, []);

    // 🎧 Cambiar el dispositivo de salida de audio
    useEffect(() => {
        if (audioRef.current && playerStore.selectedDeviceId) {
            const audioElement = audioRef.current;
            if (typeof audioElement.setSinkId === "function") {
                audioElement.setSinkId(playerStore.selectedDeviceId).catch((err) => {
                    console.error("❌ Error setting sinkId:", err);
                });
            } else {
                console.warn("⚠️ setSinkId() no es compatible en este navegador.");
            }
        }
    }, [playerStore.selectedDeviceId]); // Se ejecuta cuando cambia el `deviceId`

    return (
        <div className={`flex flex-row items-center justify-between w-full h-full z-50 transition-all duration-300 ${isFullScreen ? isButtonVisible ? "opacity-100 [background:radial-gradient(115%_115%_at_50%_10%,#ffffff00_40%,#000_100%)] player-shadow" : "opacity-0" : ""}`}>
            <div className="max-w-[300px] w-full">
                <PlayerCurrentSong {...player.currentMusic.song} />
            </div>

            <div className="grid place-content-center gap-4 flex-1">
                <div className="flex justify-center flex-col items-center">
                    <PlayerControlButtonBar />
                    <PlayerSoundControl />
                    <audio
                        ref={audioRef}
                        onEnded={() => {
                            if (player.loopMode === "song") {
                                // console.log("🔁 Loop mode: Canción. Reiniciando...");
                                playerManager.audioRef.currentTime = 0;
                                playerManager.audioRef.play();
                                playerManager.videoRef?.play();
                            } else {
                                playerManager.nextSong();
                            }
                        }}
                    />
                </div>
            </div>

            <div className="place-content-center max-w-[300px] w-full flex justify-end items-center gap-4">
                <PlayerMaximizeControl />
                <PlayerDevicesControl />
                <PlayerVolumeControl />
            </div>
        </div>
    );
}
