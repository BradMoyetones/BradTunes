import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { usePlayer } from './PlayerProvider';
import { CurrentMusic } from '@/utils/PlayerManager';
import { PlaylistsFull, SongFull } from '@/types/data';

interface PlaylistsContextType {
    // IMPLEMENT YOUR CONTEXT METHODS HERE
    playlists: PlaylistsFull[],
    setPlaylists: React.Dispatch<React.SetStateAction<PlaylistsFull[]>>
    songs: SongFull[]
    setSongs: React.Dispatch<React.SetStateAction<SongFull[]>>
}

const DataContext = createContext<PlaylistsContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { currentPlaylist, currentSong, setCurrentPlaylist, setCurrentSong, isShuffling } = usePlayerStore();
    const { setCurrentMusic } = usePlayer();
    const [playlists, setPlaylists] = useState<PlaylistsFull[]>([])
    const [songs, setSongs] = useState<SongFull[]>([])
    
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const result: CurrentMusic = await window.api.songs(currentPlaylist, currentSong);

                if (isShuffling) {
                    // Sacamos la canción actual
                    const filteredSongs = result.songs.filter(song => song.id !== result.song?.id);
                    
                    // Mezclamos las demás canciones
                    const shuffledSongs = filteredSongs.sort(() => Math.random() - 0.5);
                    
                    // Colocamos la canción actual en la primera posición
                    result.songs = result.song ? [result.song, ...shuffledSongs] : shuffledSongs;
                }

                setCurrentSong(result.song);
                setCurrentPlaylist(result.playlist);
                setCurrentMusic(result);

            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
            }
        };

        fetchSongs(); // Llamamos cuando se monta el componente
    }, []);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const result: CurrentMusic = await window.api.songs(null, null);

                if (isShuffling) {
                    // Sacamos la canción actual
                    const filteredSongs = result.songs.filter(song => song.id !== result.song?.id);
                    
                    // Mezclamos las demás canciones
                    const shuffledSongs = filteredSongs.sort(() => Math.random() - 0.5);
                    
                    // Colocamos la canción actual en la primera posición
                    result.songs = result.song ? [result.song, ...shuffledSongs] : shuffledSongs;
                }

                setSongs(result.songs);
            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
            }
        };

        fetchSongs(); // Llamamos cuando se monta el componente
    }, []);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const result = await window.api.playlists();

                setPlaylists(result)
            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
            }
        };

        fetchSongs(); // Llamamos cuando se monta el componente
    }, []);

    return (
        <DataContext.Provider 
            value={{ 
                // IMPLEMENT YOUR CONTEXT METHODS HERE
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

// Hook personalizado para usar el contexto
export const useData = () => {
    const context = React.useContext(DataContext);
    if (!context) {
        throw new Error('usePlaylists must be used within a PlaylistsProvider');
    }
    return context;
};
