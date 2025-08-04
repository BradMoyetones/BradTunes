import { createContext, useEffect, useMemo, useState } from "react";
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
        setCurrentPlaylist,
        setIsShuffle,
        setCurrentTime,
        currentTime,
        volume,
        setPlaybackMode,
        setVolume: setVolumeStore
    } = usePlayerStore();

    const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
    const [playQueue, setPlayQueue] = useState<Song[]>([]);
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
        if (!currentSong || playQueue.length === 0 || !howlInstance) return;

        if (playbackMode === "repeat-one") {
            howlInstance.seek(0);
            howlInstance.play();
            return;
        }

        const currentIdx = playQueue.findIndex(song => song.id === currentSong.id);
        const isLast = currentIdx === playQueue.length - 1;

        if (isLast) {
            if (playbackMode === "repeat-all") {
                const first = playQueue[0];
                loadAndPlay(first);
            } else if (playbackMode === "none") {
                howlInstance.stop();
                setIsPlaying(false);
            }
        } else {
            const next = playQueue[currentIdx + 1];
            loadAndPlay(next);
        }
    };

    const playPrevious = () => {
        if (!currentSong || playQueue.length === 0 || !howlInstance) return;

        if (playbackMode === "repeat-one") {
            howlInstance.seek(0);
            howlInstance.play();
            return;
        }

        const currentIdx = playQueue.findIndex(song => song.id === currentSong.id);
        const isFirst = currentIdx === 0;

        const currentSeek = howlInstance.seek() ?? 0;

        if (currentSeek > 3) {
            howlInstance.seek(0);
            howlInstance.play();
            return;
        }

        if (isFirst) {
            if (playbackMode === "repeat-all") {
                const last = playQueue[playQueue.length - 1];
                loadAndPlay(last); 
            } else if (playbackMode === "none") {
                howlInstance.stop();
                setIsPlaying(false);
            }
        } else {
            const previous = playQueue[currentIdx - 1];
            loadAndPlay(previous);
        }
    };

    const loadAndPlay = (song: Song) => {
        howlInstance?.unload(); // descarga anterior

        const newHowl = new Howl({
            src: [`safe-file://${musicPath}/${song.song}`],
            volume,
            html5: true,
            onend: playNext,
        });

        newHowl.once("load", () => {
            newHowl.seek(0); // empieza desde 0
            newHowl.play();
            setIsPlaying(true);
        });

        setHowlInstance(newHowl);
        setCurrentSong(song);
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
            ? songs.filter((s) =>
                playlistSongs.some((ps) => ps.playlistId === playlist.id && ps.songId === s.id))
            : songs;

        const index = list.findIndex((s) => s.id === selectedSong.id);
        const shuffled = isShuffle
            ? [list[index], ...shuffleArray(list.filter((s) => s.id !== selectedSong.id))]
            : list;

        setOriginalQueue(list);
        setPlayQueue(shuffled);
        setCurrentSong(selectedSong);
        setCurrentPlaylist(playlist || null);
    };

    const togglePlay = () => {
        if (!howlInstance) return;

        if (howlInstance.playing()) {
            howlInstance.pause();
            setIsPlaying(false);
        } else {
            howlInstance.play();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (!howlInstance) return;
        howlInstance.pause();
        setIsPlaying(false);
    };

    const resume = () => {
        if (!howlInstance) return;
        howlInstance.play();
        setIsPlaying(true);
    };

    const toggleShuffle = () => {
        if (!currentSong) return;

        const current = currentSong;
        const rest = originalQueue.filter((value) => value.id !== current.id);

        const newQueue = !isShuffle
            ? [current, ...shuffleArray(rest)]
            : originalQueue;

        setPlayQueue(newQueue);
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
        if(!currentSong) return
        const newHowl = new Howl({
            src: [`safe-file://${musicPath}/${currentSong.song}`],
            volume,
            html5: true,
            onend: playNext,
        });

        newHowl.once('load', function(){
            newHowl.seek(currentTime)
        });
        
        setHowlInstance(newHowl)
        generatePlayQueue(currentSong, currentPlaylist)
    }, [musicPath, playlistSongs, songs])
    
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

                const time = howlInstance.seek();
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
                setSeekAndSync,
                pause,
                resume,
                loadAndPlay
            }}
        >
            {children}
        </PlayerControllerContext.Provider>
    );
};

