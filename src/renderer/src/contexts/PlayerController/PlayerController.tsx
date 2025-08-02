import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { PlaybackMode, usePlayerStore } from "@/store/usePlayerStore";
import { Playlist, Song } from "@core/types/data";
import { useMusicPathStore } from "@/store/useMusicPathStore/useMusicPathStore";
import { PlayerControllerContextValue } from "./PlayerController.types";
import { useData } from "../DataProvider";
import {Howl} from 'howler';
import { shuffleArray } from "@/utils/array";

export const PlayerControllerContext = createContext<PlayerControllerContextValue | null>(null);

export const PlayerControllerProvider = ({ children }: { children: React.ReactNode }) => {
    const { 
        currentSong, 
        currentPlaylist, 
        playbackMode, 
        isShuffle, 
        setCurrentSong, 
        setIsShuffle,
        setCurrentTime,
        currentTime,
        volume,
        setPlaybackMode,
        setVolume: setVolumeStore
    } = usePlayerStore();

    const [playQueue, setPlayQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [howlInstance, setHowlInstance] = useState<Howl | null>(null);

    const {musicPath} = useMusicPathStore();
    const {songs, playlistSongs} = useData();
    const [isPlaying, setIsPlaying] = useState(false)

    const setVolumeAndSync = (newVolume: number) => {
        if (howlInstance) {
            howlInstance.volume(newVolume);
        }
        setVolumeStore(newVolume); // actualiza zustand
    };

    const setSeekAndSync = (value: number) => {
        if (howlInstance) {
            howlInstance.seek(value);
        }
        setCurrentTime(value); // actualiza zustand
    };

    // Cargar canciones de una playlist
    const playNext = () => {
        if (playbackMode === "repeat-one") {
            howlInstance?.seek(0);
            howlInstance?.play();
            return;
        }

        const isLast = currentIndex === playQueue.length - 1;

        if (isLast) {
            if (playbackMode === "repeat-all") {
                setCurrentIndex(0);
            } else if (playbackMode === "none") {
                howlInstance?.stop();
                setIsPlaying(false);
            }
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const playPrevious = () => {
        if (playbackMode === "repeat-one") {
            howlInstance?.seek(0);
            howlInstance?.play();
            return;
        }

        const isFirst = currentIndex === 0;

        if (isFirst) {
            if (playbackMode === "repeat-all") {
                setCurrentIndex(playQueue.length - 1);
            } else if (playbackMode === "none") {
                howlInstance?.stop();
                setIsPlaying(false);
            }
        } else {
            setCurrentIndex(currentIndex - 1);
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

    const generatePlayQueue = (selectedSong: Song, playlist?: Playlist | null) => {
        const list = playlist
            ? songs.filter((s) => playlistSongs.some((ps) => ps.playlistId === playlist.id && ps.songId === s.id))
            : songs;

        const shuffled = isShuffle
            ? [selectedSong, ...shuffleArray(list.filter(s => s.id !== selectedSong.id))]
            : list;

        setPlayQueue(shuffled);
        const index = shuffled.findIndex(s => s.id === selectedSong.id);
        setCurrentIndex(index);
    };

    const togglePlay = useCallback(() => {
        if (!howlInstance) return;

        // Si ya está reproduciendo, pausamos
        if (howlInstance.playing()) {
            howlInstance.pause();
            setIsPlaying(false);
            return;
        }

        // Si está en el último índice y en modo "none", volver al inicio
        const isAtEnd = currentIndex === playQueue.length - 1;
        if (playbackMode === "none" && isAtEnd) {
            const firstSong = playQueue[0];
            setCurrentIndex(0);
            setCurrentSong(firstSong);

            // Destruye el howl actual si existe
            howlInstance.unload();

            const newHowl = new Howl({
                src: [`safe-file://${musicPath}/${firstSong.song}`],
                volume,
                html5: true,
                onend: playNext,
            });

            setHowlInstance(newHowl);
            newHowl.play();
            setIsPlaying(true);
            return;
        }

        // Si todo normal, solo damos play
        howlInstance.play();
        setIsPlaying(true);
    }, [howlInstance, currentSong, playbackMode, currentPlaylist, musicPath, currentIndex]);

    const toggleShuffle = () => {
        const current = playQueue[currentIndex];
        const rest = playQueue.filter((_, i) => i !== currentIndex);

        const shuffled = isShuffle
            ? [current, ...rest] // volver al orden original (opcional: ordenar)
            : [current, ...shuffleArray(rest)];

        setPlayQueue(shuffled);
        setCurrentIndex(0);
        setIsShuffle(!isShuffle);
    };

    const toggleLoopMode = () => {
        const modes: PlaybackMode[] = ["none", "repeat-all", "repeat-one"];
        const currentIndex = modes.indexOf(playbackMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setPlaybackMode(nextMode);
    };
    
    // Efecto que inicializa el howler con los datos del store
    useEffect(() => {
        const newHowl = new Howl({
            src: [`safe-file://${musicPath}/${currentSong?.song}`],
            volume,
            html5: true,
            onend: playNext,
        });

        newHowl.once('load', function(){
            newHowl.seek(currentTime)
        });
        
        setHowlInstance(newHowl)
    }, [musicPath])
    
    // Efecto para actualizar el currentTime del store
    useEffect(() => {
        if (!howlInstance) return;

        let animationFrameId: number;

        const updateCurrentTime = () => {
            const loop = () => {
                if (!howlInstance || !howlInstance.playing()) {
                    animationFrameId = requestAnimationFrame(loop); // Sigue esperando
                    return;
                }

                const time = howlInstance.seek() as number;
                setCurrentTime(time);
                animationFrameId = requestAnimationFrame(loop);
            };
            loop();
        };

        // Solo empieza el loop una vez haya empezado a reproducirse
        howlInstance.once('play', updateCurrentTime);

        // También lo reiniciamos si hacen seek manual
        howlInstance.on('seek', updateCurrentTime);

        return () => {
            cancelAnimationFrame(animationFrameId);
            howlInstance.off('seek', updateCurrentTime);
            howlInstance.off('play', updateCurrentTime);
        };
    }, [howlInstance]);

    return (
        <PlayerControllerContext.Provider 
            value={{ 
                howlInstance, 
                isSameSong,
                playNext, 
                playPrevious, 
                generatePlayQueue,
                toggleLoopMode,
                togglePlay,
                toggleShuffle,
                isPlaying,
                setIsPlaying,
                setVolumeAndSync,
                setSeekAndSync
            }}
        >
            {children}
        </PlayerControllerContext.Provider>
    );
};

