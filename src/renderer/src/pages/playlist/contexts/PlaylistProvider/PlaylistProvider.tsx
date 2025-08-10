import { createContext, useEffect, useMemo, useState } from "react";
import { PlaylistProviderProps } from "./PlaylistProvider.types";
import { useData } from "@/contexts";
import { PlaylistWithSongs, SongFull } from "@core/types/data";

export const PlaylistContext = createContext<PlaylistProviderProps | null>(null);

export const PlaylistProvider = ({ children, id }: { children: React.ReactNode, id: string | undefined }) => {
    const [playlistId] = useState(id)
    const [loading, setLoading] = useState(true);
    const [artistsString, setArtistsString] = useState<string>("");
    const { playlists } = useData();
    const [playlist, setPlaylist] = useState<PlaylistWithSongs>({
        id: "0",
        title: "Not Found",
        cover: "",
        date: "",
        playlist_songs: []
    });
    const [songs, setSongs] = useState<SongFull[]>([]);
    

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true)
            try {
                const result = await window.api.songsXplaylist(id);

                const artists = result.length > 0
                    ? result.map((e) => e.artist).join(", ")
                    : "No artists found";
                setArtistsString(artists)
                setSongs(result)
                console.log(result);
                
            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
            }finally {
                setLoading(false)
            }
        };

        fetchSongs(); // Llamamos cuando se monta el componente
    }, [id, playlist]);

    useEffect(() => {
        const currentPlaylist = playlists.find((playlist) => String(playlist.id) === id);
        if (currentPlaylist) {
            setPlaylist(currentPlaylist);
        }
    }, [id, playlists])

    const horasTotales = useMemo(() => {
        let sumTotal = 0;

        if (songs.length) {
            songs.forEach((data) => {
                sumTotal += data.duration; // en segundos
            });

            const dias = Math.floor(sumTotal / 86400); // 60*60*24
            const horas = Math.floor((sumTotal % 86400) / 3600); // 60*60
            const minutos = Math.floor((sumTotal % 3600) / 60);

            if (dias > 0) return `${dias}d ${horas}h ${minutos}min`;
            if (horas > 0) return `${horas}h ${minutos}min`;
            return `${minutos}min`;
        }

        return '';
    }, [songs]);

    return (
        <PlaylistContext.Provider 
            value={{ 
                playlistId,
                loading,
                artistsString,
                playlist,
                horasTotales,
                songs
            }}
        >
            {children}
        </PlaylistContext.Provider>
    );
};

