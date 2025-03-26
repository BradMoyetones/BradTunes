import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { usePlayer } from "@/contexts/PlayerProvider";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export default function Video() {
    const { currentSong, currentTime } = usePlayerStore();
    const player = usePlayer();
    const playerManager = usePlayerManager();
    const { isFullScreen, isCursorHidden, enterFullScreen, exitFullScreen } = useVideoFullScreen();
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && playerManager.videoRef && player.currentMusic.song) {
            playerManager.setVideoElement(videoRef.current);
            playerManager.videoRef.src = player.currentMusic.song.video;
            playerManager.videoRef.currentTime = currentTime;
            if (!playerManager.audioRef.paused) playerManager.videoRef.play();
        }
    }, []);

    // 🔥 Verificar sincronización de audio y video
    useEffect(() => {
        const syncVideoWithAudio = () => {
            if (!videoRef.current || !playerManager.audioRef) return;
            
            const video = videoRef.current;
            const audio = playerManager.audioRef;

            const videoTime = video.currentTime;
            const audioTime = audio.currentTime;
            const timeDifference = Math.abs(videoTime - audioTime);

            if (timeDifference > 0.1) { // Si hay más de 0.3s de diferencia, sincroniza
                // console.log(`⏳ Desfase detectado: ${timeDifference.toFixed(3)}s. Corrigiendo...`);
                video.currentTime = audioTime;
            }
        };

        const interval = setInterval(syncVideoWithAudio, 500); // Verificar cada 500ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`${isFullScreen ? "fixed inset-0 bg-black" : "relative h-full"} ${isCursorHidden && "cursor-none"} transition-all duration-300`}>
            <div className="w-full h-full flex relative items-center justify-center overflow-hidden">
                {!isFullScreen && (
                    <video 
                        src={currentSong?.video} 
                        autoPlay 
                        loop 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover blur-3xl brightness-50 scale-110"
                    />
                )}
                <video 
                    onDoubleClick={() => {
                        if(!isFullScreen){
                            enterFullScreen()
                        }else{
                            exitFullScreen()
                        }
                    }}
                    onClick={player.togglePlay}
                    ref={videoRef} 
                    poster={`/music/${currentSong?.image}`} 
                    className={`object-cover object-center ${isFullScreen ? "w-full h-full" : "w-[95%] h-[90%]"} z-50 rounded-2xl`} 
                    muted 
                />
            </div>

            {!isFullScreen && (
                <div className="p-4">
                    <h1 className="font-bold text-2xl">{currentSong?.title}</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">{currentSong?.artist}</p>
                </div>
            )}
        </div>
    );
}
