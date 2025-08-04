import { useEffect, useRef } from "react";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { useMusicPath, usePlayerController } from "@/contexts";
import { usePlayerStore } from "@/store";

export default function Video() {
    const { currentSong, currentTime } = usePlayerStore();
    const {howlRef, togglePlay} = usePlayerController();
    const { isFullScreen, isCursorHidden, enterFullScreen, exitFullScreen } = useVideoFullScreen();
    const { musicPath } = useMusicPath()
    const videoRef = useRef<HTMLVideoElement>(null);
    const backgroundVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current;
        const backVideo = backgroundVideoRef.current
        if (!video || !backVideo || !currentSong?.video) return;

        video.src = `safe-file://${musicPath}/${currentSong.video}`;
        backVideo.src = `safe-file://${musicPath}/${currentSong.video}`;
        video.currentTime = currentTime;
        backVideo.currentTime = currentTime;

        const handleCanPlay = () => {
            if (!howlRef.current?.playing()) return;
            video.play().catch(err => console.error("Video play error:", err));
            backVideo.play().catch(err => console.error("Video play error:", err));
        };

        video.addEventListener("canplay", handleCanPlay);
        backVideo.addEventListener("canplay", handleCanPlay);
        return () => {
            video.removeEventListener("canplay", handleCanPlay);
            backVideo.removeEventListener("canplay", handleCanPlay);
        };
    }, [currentSong]);
    
    // 🔥 Verificar sincronización de audio y video
    useEffect(() => {
        const sync = () => {
            const video = videoRef.current;
            const backVideo = backgroundVideoRef.current

            if (!video || !backVideo || !howlRef.current) return;

            const audioTime = howlRef.current.seek() as number;
            const videoTime = video.currentTime;
            const backVideoTime = backVideo.currentTime;
            const diff = videoTime - audioTime;
            const backDiff = backVideoTime - audioTime;

            if (Math.abs(diff) > 0.5) {
                video.currentTime = audioTime;
            } else {
                // Ajuste fino con playbackRate
                video.playbackRate = 1 - diff * 0.1;
            }

            if (Math.abs(backDiff) > 0.5) {
                backVideo.currentTime = audioTime;
            } else {
                // Ajuste fino con playbackRate
                backVideo.playbackRate = 1 - diff * 0.1;
            }
        };

        const id = setInterval(sync, 500);
        return () => clearInterval(id);
    }, [howlRef.current]);

    const togglePlayVideo = () => {
        const video = videoRef.current;
        const backVideo = backgroundVideoRef.current
        if (!video || !backVideo) return;

        if (howlRef.current?.playing()) {
            video.pause();
            backVideo.pause();
        } else {
            video.play().catch(() => {});
            backVideo.play().catch(() => {});
        }

        togglePlay();
    };

    return (
        <div className={`${isFullScreen ? "fixed inset-0 bg-black" : "relative h-full"} ${isCursorHidden && "cursor-none"} transition-all duration-300`}>
            <div className="w-full h-full flex relative items-center justify-center overflow-hidden">
                <video 
                    ref={backgroundVideoRef}
                    playsInline 
                    loop 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-110"
                />
                <video 
                    onDoubleClick={() => {
                        if(!isFullScreen){
                            enterFullScreen()
                        }else{
                            exitFullScreen()
                        }
                    }}
                    onClick={togglePlayVideo}
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
