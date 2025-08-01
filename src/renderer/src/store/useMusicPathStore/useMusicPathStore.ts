import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MusicPathState } from "./useMusicPathStore.types";

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
