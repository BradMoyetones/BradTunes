import { CardPlayButton } from "@/components/CardPlayButton";
import { MusicsTable } from "@/components/MusicsTable";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataProvider";
import Search from "@/icons/Search";
import { useMusicPathStore } from "@/store/useMusicPathStore";
import { PlaylistsFull, PlaylistSongsFull, SongFull } from "@/types/data";
import { FilterX } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Playlist() {
    const { playlists } = useData();
    const { theme } = useTheme();
    const { id } = useParams<{ id: string }>();
    const [songs, setSongs] = useState<SongFull[]>([]);
    const { musicPath } = useMusicPathStore();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Función para eliminar una canción por ID
    const deleteSong = (songId: number) => {
        // Filtra la canción con el ID proporcionado
        const updatedSongs = songs.filter((song) => song.id !== songId);
        setSongs(updatedSongs); // Actualiza el estado con la lista de canciones actualizada
    };

    const addSongToPlaylist = (songId: number, createPlaylistSong: PlaylistSongsFull) => {
        setSongs(prevSongs =>
            prevSongs.map(s =>
                s.id === songId // Suponiendo que `createPlaylistSong.songId` tiene el ID de la canción
                    ? { ...s, playlist_songs: [...s.playlist_songs, createPlaylistSong] }
                    : s
            )
        );
    };

    const handleToggle = () => {
        // Si hay texto, no cerrar
        setOpen(prev => !prev);
        if(!open){
            inputRef.current?.focus()
        }
    };

    const handleFocus = () => {
        setOpen(true);
    };

    const handleBlur = () => {
        // Si no hay texto, cerrar
        setTimeout(() => {
            setOpen(false);
        }, 100)
    };

    const q = query.toLowerCase().trim();

    const filteredSongs = useMemo(() => {
        return songs.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        );
    }, [songs, q]);
    
    return (
        <div
            id="playlist-container"
            className="relative flex flex-col h-full bg-slate-200 dark:bg-zinc-900 bg-gradient-to-t from-50% from-slate-200 via-slate-200/80 dark:from-zinc-900 dark:via-zinc-900/80 rounded-lg overflow-auto"
            style={{ backgroundColor: theme === "dark" ? playlist?.color.dark : playlist?.color.accent, viewTransitionName: `playlist-box-${id}` }}
        >
            <header className="flex flex-row gap-8 px-6 mt-12">
                <picture className="aspect-square w-52 h-52 flex-none">
                    <img
                        src={`safe-file://${musicPath}/img/playlists/${playlist?.cover}`}
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

            <div className="px-6 pt-6 flex items-center justify-between">
                <CardPlayButton playlist={playlist} song={songs[0]} />
                <div className="flex items-center gap-2">
                    
                    <Button
                        className={`${q ? "opacity-100" : "opacity-0"} transition-all`}
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => setQuery("")}
                    >
                        <FilterX />
                        <span className="sr-only">Drop filter</span>
                    </Button>
                    <div className={`flex shadow-sm rounded-full hover:opacity-100 transition-all`}>
                        <button 
                            onClick={handleToggle}
                            className={`${open ? "border-r rounded-l-full" : "rounded-full"} flex items-center justify-center bg-muted p-3 rounded-l-full border-border dark:border-zinc-100/10`}
                        >
                            <Search />
                        </button>
                        <input
                            ref={inputRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className={`${open ? "opacity-100" : "opacity-0"} rounded-r-full bg-muted text-base transition-[width,padding,opacity] duration-300 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                            style={{
                                width: open ? '200px' : '0px',
                                paddingLeft: open ? '0.75rem' : '0',
                                paddingRight: open ? '0.75rem' : '0',
                                paddingTop: open ? '0.25rem' : '0',
                                paddingBottom: open ? '0.25rem' : '0',
                            }}
                            placeholder="Buscar..."
                        />
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-6 pt-10"></div>

            <section className="p-6">
                <MusicsTable songs={filteredSongs} playlist={playlist} deleteSong={deleteSong} addSongToPlaylist={addSongToPlaylist} />
            </section>
        </div>
    );
}
