import { useState, useRef, useMemo } from "react";
import Search from "@/icons/Search";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useData } from "@/contexts/DataProvider";
import { Link } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { useMusicPathStore } from "@/store/useMusicPathStore";
import { usePlayer } from "@/contexts/PlayerProvider";
import MusicVisualizer from "./MusicVisualizer";

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const { playlists, songs } = useData();
    const playerM = usePlayerManager();
    const { musicPath } = useMusicPathStore();


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
            setQuery("")
            setOpen(false);
        }, 100)
    };

    const q = query.toLowerCase().trim();

    // FILTRADO
    const filteredPlaylists = useMemo(() => {
        if (!q) return playlists.slice(0, 5); // muestra primeras 5 sin búsqueda

        return playlists.filter(p => {
            const matchesTitle = p.title.toLowerCase().includes(q);
            const matchesSong = p.playlist_songs.some(ps =>
                ps.song.title.toLowerCase().includes(q) ||
                ps.song.artist.toLowerCase().includes(q)
            );
            return matchesTitle || matchesSong;
        });
    }, [playlists, q]);

    const filteredSongs = useMemo(() => {
        if (!q) {
            // Top 10 por reproducciones si no hay búsqueda
            return [...songs].sort((a, b) => b.reproductions - a.reproductions).slice(0, 10);
        }

        return songs.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        );
    }, [songs, q]);

    const noResults = q && filteredPlaylists.length === 0 && filteredSongs.length === 0;

    console.log(playlists);
    
    return (
        <div
            className="no-drag h-full flex justify-center flex-col relative transition-[max-width] duration-300 ease-in-out"
            style={{
                maxWidth: open ? '100%' : '98px', // ajustá según tu diseño
                width: '100%', // siempre ocupa todo el contenedor padre
            }}
        >

            <div className={`${open ? "opacity-100" : "opacity-60"} flex shadow-sm rounded-full border border-border hover:opacity-100 transition-all`}>
                <button 
                    onClick={handleToggle}
                    className="flex items-center justify-center bg-muted p-3 rounded-l-full border-r border-border dark:border-zinc-100/10"
                >
                    <Search />
                </button>
                <input
                    ref={inputRef}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className={`bg-muted text-base transition-[width,padding] duration-300 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    style={{
                        width: open ? '100%' : '0px',
                        paddingLeft: open ? '0.75rem' : '0',
                        paddingRight: open ? '0.75rem' : '0',
                        paddingTop: open ? '0.25rem' : '0',
                        paddingBottom: open ? '0.25rem' : '0',
                    }}
                    placeholder="Buscar..."
                />
                <button
                    onClick={handleToggle}
                    className="flex items-center justify-center bg-muted p-3 rounded-r-full border-l border-border dark:border-zinc-100/10"
                >
                    <ChevronLeft className={`${open && "-rotate-90"} transition-all`} />
                </button>
            </div>

            <div className={`absolute top-16 rounded-sm z-50 p-2 bg-muted w-full transition-all duration-300 ease-in-out ${open ? "h-96 opacity-100" : "h-0 opacity-0"} overflow-hidden`}>
                <ScrollArea className="h-full">
                    {noResults ? (
                        <div className="flex items-center justify-center h-80">
                            <p className="text-sm flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                <AlertCircle />
                                No se encontraron resultados para "{query}"
                            </p>
                        </div>
                    ) : (
                        <>
                            {filteredPlaylists.length > 0 && (
                                <>
                                    <h2 className="text-sm font-semibold mb-2">Playlists</h2>
                                    {filteredPlaylists.map(playlist => (
                                        <CardSearch
                                            key={playlist.id+"-playlist-searched"}
                                            title={playlist.title}
                                            paragraph={`${playlist.playlist_songs.length} canción(es)`}
                                            image={`safe-file://${musicPath}/img/playlists/${playlist.cover}`}
                                            url={`/playlist/${playlist.id}`}
                                        />
                                    ))}
                                </>
                            )}

                            {filteredSongs.length > 0 && (
                                <>
                                    <h2 className={`text-sm font-semibold mb-2 ${filteredPlaylists.length > 0 ? "mt-2" : ""}`}>Songs</h2>
                                    {filteredSongs.map(song => (
                                        <CardSearch
                                            id={song.id}
                                            key={song.id+"-song-searched"}
                                            title={song.title}
                                            paragraph={song.artist}
                                            image={`safe-file://${musicPath}/img/${song.image}`}
                                            callBack={() => playerM.changePlaylistAndSong(null, song)}
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}

interface CardSearchProps {
    id?: number;
    title: string;
    paragraph: string;
    image: string;
    url?: string
    callBack?: () => void;
}

const CardSearch = ({callBack, paragraph, title, image, url, id}: CardSearchProps) => {
    const { currentMusic } = usePlayer()
    
    const playerM = usePlayerManager();

    const isCurrentSong = (songId: number) => {
        return currentMusic.song?.id === songId && !playerM.audioRef.paused
    }
    const isPlaying = (id && isCurrentSong(id));

    return (
        <>
            {url ? (
                <Link to={url} viewTransition className="border w-full text-left p-2 rounded-sm flex bg-white dark:bg-black hover:bg-slate-200 dark:hover:bg-zinc-900 transition-all gap-2 cursor-pointer">
                    <div className="size-10 aspect-square rounded-sm overflow-hidden flex-shrink-0">
                        <img src={image} alt="song" className="object-cover object-center w-full h-full" />
                    </div>
                    <div>
                        <h3 className="text-md font-bold line-clamp-1">{title}</h3>
                        <p className="text-xs line-clamp-1">{paragraph}</p>
                    </div>
                </Link>
            ): (
                <button 
                    onClick={callBack}
                    className="border w-full text-left p-2 rounded-sm flex bg-white dark:bg-black hover:bg-slate-200 dark:hover:bg-zinc-900 transition-all gap-2 cursor-pointer"
                >
                    <div className="size-10 aspect-square rounded-sm overflow-hidden flex-shrink-0">
                        <img src={image} alt="song" className="object-cover object-center w-full h-full" />
                    </div>
                    <div>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {isPlaying && (
                                    <MusicVisualizer numBars={5} width={20} height={18} />
                                )}
                            </div>
                            <h3 className={`text-md font-bold line-clamp-1 ${isPlaying && "text-primary"}`}>
                                {title}
                            </h3>
                        </div>
                        <p className="text-xs line-clamp-1">{paragraph}</p>
                    </div>
                </button>
            )}
        </>
    )
}