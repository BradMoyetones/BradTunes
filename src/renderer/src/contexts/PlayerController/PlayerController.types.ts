import { Playlist, Song } from "@core/types/data";
import { SetStateAction } from "react";

export interface PlayerControllerContextValue {
    audioRef: React.RefObject<HTMLAudioElement | null>;

    isSameSong: (song?: Song | null, playlist?: Playlist | null) => boolean
    playNext: () => void;
    playPrevious: () => void;
    playSong: (song: Song, playlist?: Playlist | null) => void;
    toggleLoopMode: () => void;
    togglePlay: () => void;
    toggleShuffle: () => void;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<SetStateAction<boolean>>
}