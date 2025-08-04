import { useContext } from "react";
import { PlaylistContext } from "./PlaylistProvider";

export const usePlaylist = () => {
    const context = useContext(PlaylistContext);
    if (!context) throw new Error("usePlaylist debe usarse dentro de un PlaylistProvider");
    return context;
};
