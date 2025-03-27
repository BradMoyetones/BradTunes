import React, { createContext, useContext, useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore"; // Importa el store
import { usePlayerManager } from "./PlayerManagerContext";
import { PlayerState } from "@/utils/PlayerManager";
import { useMusicPathStore } from "@/store/useMusicPathStore";

// Creamos el contexto
const PlayerContext = createContext<PlayerState | undefined>(undefined);

// Proveedor del contexto
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const playerStore = usePlayerStore(); // Accede al estado desde Zustand
    const player = usePlayerManager();
    const pathStore = useMusicPathStore();

    const [state, setState] = useState<PlayerState>({
        currentMusic: {
            playlist: playerStore.currentPlaylist,
            song: playerStore.currentSong,
            songs: [],
        },
        isPlaying: false,
        volume: playerStore.volume,
        currentTime: playerStore.currentTime,
        duration: playerStore.duration,
        loopMode: playerStore.loopMode,
        isShuffling: playerStore.isShuffling,
        selectedDeviceId: playerStore.selectedDeviceId,

        changeSong: (song) => {
            player.changeSong(song);
            playerStore.setCurrentSong(song);
        },
        togglePlay: () => {
            player.togglePlay();
        },
        setVolume: (vol) => {
            player.setVolume(vol);
            playerStore.setVolume(vol);
        },
        seek: (time) => {
            player.seek(time);
            playerStore.setCurrentTime(time);
        },
        nextSong: () => player.nextSong(),
        prevSong: () => player.prevSong(),

        setCurrentMusic: (newMusic) => {
            setState((prevState) => ({
                ...prevState,
                currentMusic: newMusic,
            }));
            playerStore.setCurrentPlaylist(newMusic.playlist);
            playerStore.setCurrentSong(newMusic.song);
        },

        toggleShuffle: () => player.toggleShuffle(),
        toggleLoopMode: () => player.toggleLoopMode(),
    });

    // 📌 Sincroniza `PlayerProvider` con `usePlayerStore`
    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            currentMusic: {
                playlist: playerStore.currentPlaylist,
                song: playerStore.currentSong,
                songs: prevState.currentMusic.songs, // Mantener la lista de canciones
            },
            volume: playerStore.volume,
            currentTime: playerStore.currentTime,
            duration: playerStore.duration,
            loopMode: playerStore.loopMode,
            isShuffling: playerStore.isShuffling,
            selectedDeviceId: playerStore.selectedDeviceId,
        }));
    }, [
        playerStore.currentPlaylist,
        playerStore.currentSong,
        playerStore.volume,
        playerStore.currentTime,
        playerStore.duration,
        playerStore.loopMode,
        playerStore.isShuffling,
        playerStore.selectedDeviceId,
        pathStore.musicPath
    ]);

    // 📌 Conectar el `PlayerManager` con el estado global
    useEffect(() => {
        player.audioRef.src = `safe-file://${pathStore.musicPath}/${playerStore.currentSong?.song}`;
    }, [pathStore.musicPath]); // 🔥 Agregado `player` como dependencia para evitar referencias obsoletas

    useEffect(() => {
        player.updateState = setState;
    }, [player]); // 🔥 Agregado `player` como dependencia para evitar referencias obsoletas

    return <PlayerContext.Provider value={state}>{children}</PlayerContext.Provider>;
};

// Hook para usar el contexto
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer debe usarse dentro de PlayerProvider");
    }
    return context;
};
