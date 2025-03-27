import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { Maximize, Minimize } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";

export default function PlayerMaximizeControl() {
    const { enterFullScreen, exitFullScreen, isFullScreen } = useVideoFullScreen();
    const navigate = useNavigate();
    const location = useLocation();
    const [pendingNavigation, setPendingNavigation] = useState(false);

    const toggleScreen = () => {
        if (location.pathname === "/video/1") {
            // Si ya estamos en la página de video, hacer toggle sin navegar
            if (isFullScreen) {
                exitFullScreen();
            } else {
                enterFullScreen();
            }
        } else {
            // Si estamos en otra página, navegar primero y luego cambiar pantalla completa
            setPendingNavigation(true);
            navigate("/video/1", { viewTransition: true });
        }
    };

    // Efecto para detectar cuando la navegación terminó
    useEffect(() => {
        if (pendingNavigation) {
            setPendingNavigation(false); // Resetear el estado
            enterFullScreen(); // Activar pantalla completa después de la navegación
        }
    }, [location.pathname]); // Se ejecuta cuando cambia la ruta

    return (
        <button className={`opacity-50 hover:opacity-100 transition-all ${isFullScreen && "text-white"}`} onClick={toggleScreen}>
            <Maximize className={`size-4 ${isFullScreen ? "hidden" : ""}`} />
            <Minimize className={`size-4 ${!isFullScreen ? "hidden" : ""}`} />
        </button>
    );
}
