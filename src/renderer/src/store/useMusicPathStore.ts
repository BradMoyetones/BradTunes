import { create } from "zustand";
import { persist } from "zustand/middleware";

type MusicPathState = {
  musicPath: string;
  setMusicPath: (path: string) => void;
};

export const useMusicPathStore = create(
  persist<MusicPathState>(
    (set) => ({
      musicPath: "",
      setMusicPath: (path) => set({ musicPath: path }),
    }),
    {
      name: "music-path-storage", // 🔹 Nombre en localStorage
    }
  )
);
