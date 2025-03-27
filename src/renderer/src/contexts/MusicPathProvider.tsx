import { useMusicPathStore } from "@/store/useMusicPathStore";
import { createContext, useContext, useEffect, useState } from "react";

type MusicPathContextType = {
    musicPath: string;
    defaultPath: boolean;
    isLoading: boolean;
    changePath: () => Promise<void>;
    resetPath: () => Promise<void>;
    varifyDefaultPath: () => Promise<void>;
};

const MusicPathContext = createContext<MusicPathContextType | undefined>(undefined);

export const MusicPathProvider = ({ children }: { children: React.ReactNode }) => {
    const [musicPath, setMusicPath] = useState("");
    const [defaultPath, setDefaultPath] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const setMusicPathInStore = useMusicPathStore((state) => state.setMusicPath);

    useEffect(() => {
        const fetchMusicPath = async () => {
            setIsLoading(true);
            try {
                const path = await window.api.getMusicPath();
                setMusicPath(path);
                setMusicPathInStore(path);
                await varifyDefaultPath();
            } finally {
                setIsLoading(false);
            }
        };

        fetchMusicPath();
    }, []);

    const changePath = async () => {
        setIsLoading(true);
        try {
            const newPath = await window.api.selectMusicFolder();
            if (newPath) {
                await window.api.setMusicPath(newPath);
                setMusicPath(newPath);
                setMusicPathInStore(newPath);
                await varifyDefaultPath();
                window.location.reload(); // 🔄 Recargar la aplicación
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetPath = async () => {
        setIsLoading(true);
        try {
            await window.api.resetMusicPath();
            const defaultPath = await window.api.getMusicPath();
            setMusicPath(defaultPath);
            setMusicPathInStore(defaultPath);
            await varifyDefaultPath();
            window.location.reload(); // 🔄 Recargar la aplicación
        } finally {
            setIsLoading(false);
        }
    };

    const varifyDefaultPath = async () => {
        setIsLoading(true);
        try {
            const isDefault = await window.api.isDefaultMusicPath();
            setDefaultPath(isDefault);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MusicPathContext.Provider value={{ musicPath, defaultPath, isLoading, changePath, resetPath, varifyDefaultPath }}>
            {children}
        </MusicPathContext.Provider>
    );
};

export const useMusicPath = () => {
    const context = useContext(MusicPathContext);
    if (!context) throw new Error("useMusicPath debe usarse dentro de un MusicPathProvider");
    return context;
};
