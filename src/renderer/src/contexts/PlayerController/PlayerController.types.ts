import { Playlist, Song } from "@core/types/data";
import { SetStateAction } from "react";

export interface PlayerControllerContextValue {
    howlRef: React.MutableRefObject<Howl | null>;

    setVolumeAndSync: (value: number) => void
    setSeekAndSync: (value: number) => void
    isSameSong: (song?: Song | null, playlist?: Playlist | null) => boolean
    playNext: () => void;
    playPrevious: () => void;
    generatePlayQueue: (song: Song, playlist?: Playlist | null) => void;
    toggleLoopMode: () => void;
    togglePlay: () => void;
    toggleShuffle: () => void;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<SetStateAction<boolean>>;

    pause: () => void;
    resume: () => void;
    loadAndPlay: (song: Song) => void;
    fadeToNewSong: (targetSong: Song) => void;
}