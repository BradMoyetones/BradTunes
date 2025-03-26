import { CardPlayButton } from "@/components/CardPlayButton";
import { MusicsTable } from "@/components/MusicsTable";
import { useTheme } from "@/components/theme-provider";
import { useData } from "@/contexts/DataProvider";
import { PlaylistsFull, SongFull } from "@/types/data";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

export default function Playlist() {
    const { playlists } = useData();
    const { theme } = useTheme();
    const { id } = useParams<{ id: string }>();
    const [songs, setSongs] = useState<SongFull[]>([]);

    // Inicializar estado local
    const [artistsString, setArtistsString] = useState<string>("");
    const [playlist, setPlaylist] = useState<PlaylistsFull | null>(null);

    // Efecto para filtrar canciones y establecer la playlist
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const result = await window.api.songsXplaylist(Number(id));

                const artists = result.length > 0
                    ? result.map((e) => e.artist).join(", ")
                    : "No artists found";
                setArtistsString(artists)
                setSongs(result)
            } catch (error) {
                console.error("❌ Error fetching currentMusic:", error);
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
    

    // Cálculo de horas totales
    const horasTotales = useMemo(() => {
        let sumTotal = 0;
        if (songs.length) {
            songs.forEach((data) => {
                sumTotal += parseInt(data.duration);
            });

            const dias = Math.floor(sumTotal / 1440);
            const horas = Math.floor((sumTotal % 1440) / 60);
            const minutos = sumTotal % 60;

            if (dias > 0) return `${dias}d ${horas}h ${minutos}min`;
            if (horas > 0) return `${horas}h ${minutos}min`;
            return `${minutos}min`;
        }
        return '';
    }, [songs]);

    // Verificación si la playlist existe
    

    
    return (
        <div
            id="playlist-container"
            className="relative flex flex-col h-full bg-slate-200 dark:bg-zinc-900 bg-gradient-to-t from-50% from-slate-200 via-slate-200/80 dark:from-zinc-900 dark:via-zinc-900/80 rounded-lg"
            style={{ backgroundColor: theme === "dark" ? playlist?.color.dark : playlist?.color.accent, viewTransitionName: `playlist-box-${id}` }}
        >
            <header className="flex flex-row gap-8 px-6 mt-12">
                <picture className="aspect-square w-52 h-52 flex-none">
                    <img
                        src={playlist?.cover}
                        alt={`Cover of ${playlist?.title}`}
                        className="object-cover w-full h-full shadow-lg rounded-lg"
                        style={{ viewTransitionName: `playlist-image-${id}` }}
                    />
                </picture>

                <div className="flex flex-col justify-between">
                    <h2 className="flex flex-1 items-end">Playlist</h2>
                    <div>
                        <h1 className="text-5xl font-bold block text-accent-foreground">
                            <span style={{ viewTransitionName: `playlist-title-${id}` }}>
                                {playlist?.title}
                            </span>
                        </h1>
                    </div>

                    <div className="flex-1 flex items-end">
                        <div className="text-sm text-zinc-600 dark:text-gray-300 font-normal">
                            <div className="truncate max-w-96">
                                <span style={{ viewTransitionName: `playlist-subtitle-${id}` }}>
                                    {artistsString}
                                </span>
                            </div>
                            <p className="mt-1">
                                <span className="text-zinc-900 dark:text-white">{songs.length} {songs.length === 1 ? "song" : songs.length === 0 ? "Playlist empty" : "songs"}</span>,
                                {" "+horasTotales} aproximadamente
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="pl-6 pt-6">
                <CardPlayButton playlist={playlist} song={songs[0]} />
            </div>

            <div className="relative z-10 px-6 pt-10"></div>

            <section className="p-6">
                <MusicsTable songs={songs} playlist={playlist} />
            </section>
        </div>
    );
}
