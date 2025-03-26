import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useLastVisitedPath(basePath: string) {
    const location = useLocation();
    const navigate = useNavigate();
    const [lastPath, setLastPath] = useState<string | null>(null);

    // Guarda la última subruta visitada dentro de `basePath`
    useEffect(() => {
        if (location.pathname.startsWith(basePath)) {
            setLastPath(location.pathname);
        }
    }, [location.pathname, basePath]);

    // Función para navegar a la última ruta o a la base
    const navigateToLastPath = () => {
        navigate(lastPath ?? basePath, {viewTransition: true});
    };

    return { lastPath, navigateToLastPath };
}
