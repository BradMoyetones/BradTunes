import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { PlaybackMode, usePlayerStore } from "@/store/usePlayerStore";
import { Playlist, Song } from "@core/types/data";
import { useMusicPathStore } from "@/store/useMusicPathStore/useMusicPathStore";
import { PlayerControllerContextValue } from "./PlayerController.types";
import { useData } from "../DataProvider";
import {Howl} from 'howler';
import { shuffleArray } from "@/utils/array";

type HowlWithPrivate = Howl & {
    _sounds: {
        _node: HTMLAudioElement & {
            setSinkId?: (sinkId: string) => Promise<void>;
        };
    }[];
};


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
        selectedDeviceId,
        setVolume: setVolumeStore
    } = usePlayerStore();

    const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
    const [playQueue, setPlayQueue] = useState<Song[]>([]);
    const howlRef = useRef<Howl | null>(null);

    const {musicPath} = useMusicPathStore();
    const {songs, playlistSongs} = useData();
    const [isPlaying, setIsPlaying] = useState(false)
    const playNextRef = useRef<() => void>(() => {});

    const setVolumeAndSync = (newVolume: number) => {
        const howlInstance = howlRef.current
        if (howlInstance) {
            howlInstance.volume(newVolume);
        }
        setVolumeStore(newVolume); // actualiza zustand
    };

    const setSeekAndSync = (value: number) => {
        const howlInstance = howlRef.current
        if (howlInstance) {
            howlInstance.seek(value);
        }
        setCurrentTime(value); // actualiza zustand
    };

    // Cargar canciones de una playlist
    const playNext = () => {
        const howlInstance = howlRef.current
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
                fadeToNewSong(first);
            } else if (playbackMode === "none") {
                howlInstance.stop();
                setIsPlaying(false);
            }
        } else {
            const next = playQueue[currentIdx + 1];
            fadeToNewSong(next);
        }
    };

    const playPrevious = () => {
        const howlInstance = howlRef.current
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
                fadeToNewSong(last); 
            } else if (playbackMode === "none") {
                howlInstance.stop();
                setIsPlaying(false);
            }
        } else {
            const previous = playQueue[currentIdx - 1];
            fadeToNewSong(previous);
        }
    };

    const fadeToNewSong = (targetSong: Song) => {
        const howl = howlRef.current;
        if (!howl) return;

        // Fade out actual canción
        howl.fade(howl.volume(), 0, 500); // 500ms fade out

        setTimeout(() => {
            howl.stop(); // Detenemos después del fade
            loadAndPlay(targetSong, {
                fadeIn: true,
            }); 
        }, 500);
    };

    const loadAndPlay = (song: Song, options?: { fadeIn?: boolean }) => {
        const howlInstance = howlRef.current
        if(howlInstance){
            howlInstance.unload(); // descarga anterior
        }

        const newHowl = new Howl({
            src: [`safe-file://${musicPath}/${song.song}`],
            volume,
            html5: true,
            onend: () => playNextRef.current(),
            onplay: () => {
                if (options?.fadeIn) {
                    newHowl.fade(0, 1, 500); // Fade in suave
                }
            },
        });

        newHowl.once("load", () => {
            newHowl.seek(0); // empieza desde 0
            newHowl.play();
            setIsPlaying(true);
        });

        howlRef.current = newHowl;
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
        const howlInstance = howlRef.current
        
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
        const howlInstance = howlRef.current
        if (!howlInstance) return;
        howlInstance.pause();
        setIsPlaying(false);
    };

    const resume = () => {
        const howlInstance = howlRef.current
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
        const howlInstance = howlRef.current
        if(!currentSong) return

        if(howlInstance){
            howlInstance.unload(); // descarga anterior
        }
        
        const newHowl = new Howl({
            src: [`safe-file://${musicPath}/${currentSong.song}`],
            volume,
            html5: true,
            onend: () => playNextRef.current(),
        });

        newHowl.once('load', function(){
            newHowl.seek(currentTime)
        });
        
        howlRef.current = newHowl;
        generatePlayQueue(currentSong, currentPlaylist)
    }, [musicPath, playlistSongs, songs])
    
    // Efecto creado para establecer un ref de playNext para que howl pueda usarlo de forma contextualizada
    useEffect(() => {
        playNextRef.current = playNext;
    }, [playNext]);

    useEffect(() => {
        if (!howlRef.current) return;
    
        const updateTime = () => {
          const time = howlRef.current?.seek() ?? 0;
          setCurrentTime(time);
        };
    
        const intervalId = setInterval(() => {
          if (howlRef.current?.playing()) {
            updateTime();
          }
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, []);

    // Efecto para cambiar dinamicamente el dispositivo de salida de audio
    useEffect(() => {
        if (selectedDeviceId && howlRef.current) {
            const howl = howlRef.current as HowlWithPrivate;
            const audioElement = howl._sounds?.[0]?._node;

            if (audioElement && typeof audioElement.setSinkId === "function") {
                audioElement
                    .setSinkId(selectedDeviceId)
                    .then(() => {
                        console.log("Audio output successfully redirected.");
                    })
                    .catch((error) => {
                        console.error("Error redirecting audio output:", error);
                    });
            }
        }
    }, [selectedDeviceId])

    return (
        <PlayerControllerContext.Provider 
            value={{ 
                howlRef, 
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
                loadAndPlay,
                fadeToNewSong
            }}
        >
            {children}
        </PlayerControllerContext.Provider>
    );
};

