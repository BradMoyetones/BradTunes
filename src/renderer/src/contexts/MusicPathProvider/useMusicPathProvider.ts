import { useContext } from "react";
import { MusicPathContext } from "./MusicPathProvider";

export const useMusicPath = () => {
    const context = useContext(MusicPathContext);
    if (!context) throw new Error("useMusicPath debe usarse dentro de un MusicPathProvider");
    return context;
};
