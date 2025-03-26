import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Playlist, SongFull } from "@/types/data";

interface PlayerState {
    currentSong: SongFull | null;
    currentPlaylist: Playlist | null;
    volume: number;
    currentTime: number;
    duration: string;
    loopMode: "none" | "song" | "playlist";
    isShuffling: boolean;
    selectedDeviceId: string;

    // Métodos para actualizar el estado
    setCurrentSong: (song: SongFull | null) => void;
    setCurrentPlaylist: (playlist: Playlist | null) => void;
    setVolume: (volume: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: string) => void;
    setLoopMode: (mode: "none" | "song" | "playlist") => void;
    setIsShuffling: (isShuffling: boolean) => void;
    setSelectedDeviceId: (deviceId: string) => void;
}

// Creación del store con persistencia en localStorage
export const usePlayerStore = create<PlayerState>()(
    persist(
        (set) => ({
            currentSong: null,
            currentPlaylist: null,
            volume: 1,
            currentTime: 0,
            duration: "0:00",
            loopMode: "none",
            isShuffling: false,
            selectedDeviceId: "default",

            setCurrentSong: (song) => set({ currentSong: song }),
            setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
            setVolume: (volume) => set({ volume }),
            setCurrentTime: (time) => set({ currentTime: time }),
            setDuration: (duration) => set({ duration }),
            setLoopMode: (mode) => set({ loopMode: mode }),
            setIsShuffling: (isShuffling) => set({ isShuffling }),
            setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),
        }),
        {
            name: "player-store", // Nombre de la key en localStorage
        }
    )
);
