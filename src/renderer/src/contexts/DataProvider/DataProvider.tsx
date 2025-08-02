import { createContext, useEffect, ReactNode, useState } from 'react';
import { PlaylistSong, PlaylistWithSongs, SongFull } from '@core/types/data';
import { PlaylistsContextType } from './DataProvider.types';

export const DataContext = createContext<PlaylistsContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [playlists, setPlaylists] = useState<PlaylistWithSongs[]>([])
    const [songs, setSongs] = useState<SongFull[]>([])
    const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([])
    
    useEffect(() => {
        const fetchDataInitial = async () => {
            try {
                const resultSongs = await window.api.songs();
                const resultPlaylists = await window.api.playlists();
                const resultPlaylistSongs = await window.api.playlistSongs();

                // console.log(resultSongs, resultPlaylists, resultPlaylistSongs);

                setSongs(resultSongs);
                setPlaylists(resultPlaylists);
                setPlaylistSongs(resultPlaylistSongs);
            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
            }
        };

        fetchDataInitial(); // Llamamos cuando se monta el componente
    }, []);

    return (
        <DataContext.Provider 
            value={{ 
                playlistSongs,
                setPlaylistSongs,

                playlists,
                setPlaylists,

                songs,
                setSongs
            }}
        >
            {children}
        </DataContext.Provider>
    );
};