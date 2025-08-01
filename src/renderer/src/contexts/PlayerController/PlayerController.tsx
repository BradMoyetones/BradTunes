import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Playlist, Song } from "@core/types/data";
import { useMusicPathStore } from "@/store/useMusicPathStore/useMusicPathStore";
import { PlayerControllerContextValue } from "./PlayerController.types";
import { useData } from "../DataProvider";

export const PlayerControllerContext = createContext<PlayerControllerContextValue | null>(null);

export const PlayerControllerProvider = ({ children }: { children: React.ReactNode }) => {
    const { 
        currentSong, 
        currentPlaylist, 
        playbackMode, 
        currentTime,
        isShuffle, 
        setCurrentSong, 
        setCurrentPlaylist,
        setCurrentTime,
        setDuration
    } = usePlayerStore();

    const {musicPath} = useMusicPathStore();
    const {songs} = useData();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false)

    // Cargar canciones de una playlist
    const playNext = () => {
        if (!songs.length) return;

        let nextIndex: number;

        const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
        if (playbackMode === "repeat-one") {
            nextIndex = currentIndex;
        } else if (isShuffle) {
            nextIndex = Math.floor(Math.random() * songs.length);
        } else {
            nextIndex = (currentIndex + 1) % songs.length;
        }

        const nextSong = songs[nextIndex];
        if (nextSong) {
            setCurrentSong(nextSong);
        }
    };

    const playPrevious = () => {
        if (!songs.length) return;

        const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
        const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        const prevSong = songs[prevIndex];
        if (prevSong) {
            setCurrentSong(prevSong);
        }
    };

    const isSameSong = useMemo(() => {
        return (song?: Song | null, playlist?: Playlist | null) => {
            if (!song || !currentSong) return false;

            const isSameId = currentSong.id === song.id;
            const isSamePlaylist =
                (!playlist && !currentPlaylist) || playlist?.id === currentPlaylist?.id;

            return isSameId && isSamePlaylist;
        };
    }, [currentSong, currentPlaylist]);

    const playSong = (song: Song, playlist?: Playlist | null) => {
        if (isSameSong(song, playlist)) {
            togglePlay(); // Solo pausamos o reanudamos
            return;
        }

        setCurrentSong(song);
        setCurrentPlaylist(playlist || null);
        setIsPlaying(true); // Esto hace que el useEffect dispare el .play() en la siguiente actualización
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const toggleShuffle = () => {
        
    }

    const toggleLoopMode = () => {

    }

    


    // Setup del audio element
    useEffect(() => {
        if (!currentSong || !musicPath) return;

        const audio = new Audio(`safe-file://${musicPath}/${currentSong.song}`);
        audioRef.current = audio;

        const onEnded = () => playNext();

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration);
        };

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("timeupdate", onTimeUpdate);

        audio.load();
        audio.currentTime = currentTime || 0;
        setIsPlaying(false); // No reproducimos automáticamente

        return () => {
            audio.pause();
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("timeupdate", onTimeUpdate);
        };
    }, [currentSong, musicPath]);

    return (
        <PlayerControllerContext.Provider 
            value={{ 
                audioRef, 
                isSameSong,
                playNext, 
                playPrevious, 
                playSong,
                toggleLoopMode,
                togglePlay,
                toggleShuffle,
                isPlaying,
                setIsPlaying
            }}
        >
            {children}
        </PlayerControllerContext.Provider>
    );
};

