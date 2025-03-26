import { PlayerManager } from "@/utils/PlayerManager";
import React, { createContext, useContext } from "react";

// 📌 Crear el contexto con un valor inicial nulo
const PlayerManagerContext = createContext<PlayerManager | null>(null);

// 📌 Provider que creará y proporcionará la instancia de PlayerManager
export const PlayerManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const player = new PlayerManager(() => {}); // Se actualizará en `PlayerProvider`

    return (
        <PlayerManagerContext.Provider value={player}>
            {children}
        </PlayerManagerContext.Provider>
    );
};

// 📌 Hook personalizado para acceder a `player` en cualquier componente
export const usePlayerManager = () => {
    const context = useContext(PlayerManagerContext);
    if (!context) {
        throw new Error("usePlayerManager debe usarse dentro de PlayerManagerProvider");
    }
    return context;
};
