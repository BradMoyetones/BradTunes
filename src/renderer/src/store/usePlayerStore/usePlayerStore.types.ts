import { Playlist, Song } from "@core/types/data";

export type PlaybackMode = "none" | "repeat-one" | "repeat-all";

export interface PlayerState {
    currentSong: Song | null;
    volume: number;
    currentPlaylist: Playlist | null;
    isShuffle: boolean;
    playbackMode: PlaybackMode;
    selectedDeviceId: string | null;
    currentTime: number;

    // Actions
    setVolume: (value: number) => void;
    setPlaybackMode: (mode: PlaybackMode) => void;
    setCurrentSong: (song: Song | null) => void;
    setCurrentPlaylist: (playlist: Playlist | null) => void;
    setIsShuffle: (value: boolean) => void;
    setSelectedDeviceId: (deviceId: string | null) => void;
    setCurrentTime: (value: number) => void;
}