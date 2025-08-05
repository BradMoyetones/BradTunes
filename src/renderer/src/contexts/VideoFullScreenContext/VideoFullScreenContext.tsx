import { createContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { VideoFullScreenContextType } from "./VideoFullScreenContext.types";


export const VideoFullScreenContext = createContext<VideoFullScreenContextType | undefined>(undefined);

export function VideoFullScreenProvider({ children }: { children: React.ReactNode }) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [isCursorHidden, setIsCursorHidden] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const location = useLocation(); // Obtiene la ruta actual

    const enterFullScreen = () => {
        setIsFullScreen(true);
        document.documentElement.style.overflow = "hidden";
    };

    const exitFullScreen = () => {
        setIsFullScreen(false);
        document.documentElement.style.overflow = "";
        setIsCursorHidden(false);
    };

    // Manejar visibilidad del botón y el cursor
    const resetButtonVisibility = () => {
        setIsButtonVisible(true);
        setIsCursorHidden(false);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setIsButtonVisible(false);
            setIsCursorHidden(true);
        }, 3000);
    };

    // Detectar movimiento del mouse cuando está en pantalla completa
    useEffect(() => {
        if (isFullScreen) {
            document.addEventListener("mousemove", resetButtonVisibility);
            timeoutRef.current = setTimeout(() => {
                setIsButtonVisible(false);
                setIsCursorHidden(true);
            }, 3000);
        }

        return () => {
            document.removeEventListener("mousemove", resetButtonVisibility);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isFullScreen]);

    // 🔥 Salir de pantalla completa si no estamos en la ruta del video
    useEffect(() => {
        const videoRoutes = ["/video", "/watch"]; // Agrega las rutas donde el video puede estar en pantalla completa
        const isOnVideoPage = videoRoutes.some(route => location.pathname.startsWith(route));

        if (!isOnVideoPage && isFullScreen) {
            exitFullScreen();
        }
    }, [location.pathname, isFullScreen]);

    return (
        <VideoFullScreenContext.Provider value={{ isFullScreen, isButtonVisible, isCursorHidden, enterFullScreen, exitFullScreen }}>
            {children}
        </VideoFullScreenContext.Provider>
    );
}