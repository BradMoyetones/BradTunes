import { useContext } from "react";
import { VideoFullScreenContext } from "./VideoFullScreenContext";

export function useVideoFullScreen() {
    const context = useContext(VideoFullScreenContext);
    if (!context) {
        throw new Error("useVideoFullScreen debe estar dentro de un VideoFullScreenProvider");
    }
    return context;
}