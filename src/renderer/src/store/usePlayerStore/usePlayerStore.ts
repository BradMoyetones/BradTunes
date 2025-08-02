import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlayerState } from "./usePlayerStore.types";

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set) => ({
            currentSong: null,
            volume: 0,
            currentPlaylist: null,
            isShuffle: false,
            playbackMode: "none",
            selectedDeviceId: null,
            currentTime: 0,

            setPlaybackMode: (mode) => set({ playbackMode: mode }),

            setVolume: (value) => set({volume: value}),
            setCurrentSong: (song) => set({currentSong: song}),
            setCurrentPlaylist: (playlist) => set({currentPlaylist: playlist}),
            setIsShuffle: (value) => set({isShuffle: value}),
            setSelectedDeviceId: (deviceId) => set({selectedDeviceId: deviceId}),
            setCurrentTime: (value) => set({currentTime: value}),
        }),
        {
            name: "player-storage",
        }
    )
);
