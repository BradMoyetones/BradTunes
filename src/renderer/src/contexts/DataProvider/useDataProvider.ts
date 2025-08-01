import { useContext } from "react";
import { DataContext } from "./DataProvider";

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('usePlaylists must be used within a PlaylistsProvider');
    }
    return context;
};