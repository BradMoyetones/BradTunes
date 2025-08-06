import { Button } from '@/components/ui/button';
import { usePlayerController } from '@/contexts';
import { useImageExists } from '@/hooks/use-image-exists';
import Search from '@/icons/Search';
import { useMusicPathStore, usePlayerStore } from '@/store';
import { FilterX, Pause, Play } from 'lucide-react';
import { useMemo, useRef, useState } from 'react'
import { MusicTable } from './components';
import { usePlaylist } from './contexts';

export default function PlaylistView() {
    const { musicPath } = useMusicPathStore();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const {artistsString, horasTotales, playlist, playlistId: id, songs} = usePlaylist()
    const {generatePlayQueue, isPlaying, togglePlay, loadAndPlay} = usePlayerController()
    const {currentPlaylist} = usePlayerStore()


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
    
    const validUrl = useImageExists(`safe-file://${musicPath}/img/playlists/${playlist?.cover}`)

    // if(!loading){
    //     return (
    //         <PlaylistSkeleton id={id} />
    //     )
    // }

    // if(!playlist) {
    //     return <NotFoundPlaylist />
    // }
    
    return (
        <div
            id="playlist-container"
            className="relative flex flex-col h-full rounded-lg overflow-auto"
            style={{ viewTransitionName: `playlist-box-${id}` }}
        >
            <div className='absolute inset-0 h-[800px] bg-gradient-to-b from-primary via-background/80 z-0' />

            <div className='z-10'>
                <div className='relative'>
                <header className="flex flex-row gap-8 px-6 mt-6 blur-sm">
                    <picture className="aspect-square w-52 h-52 flex-none">
                        <img
                            src={validUrl}
                            alt={`Cover of ${playlist?.title}`}
                            className="object-cover w-full h-full shadow-lg rounded-lg"
                        />
                    </picture>

                    <div className="flex flex-col justify-between">
                        <h2 className="flex flex-1 items-end text-accent">Playlist</h2>
                        <div>
                            <h1 className="text-5xl font-bold block text-accent">
                                <span>
                                    {playlist?.title}
                                </span>
                            </h1>
                        </div>

                        <div className="flex-1 flex items-end">
                            <div className="text-sm text-accent font-medium">
                                <div className="truncate max-w-96">
                                    <span>
                                        {artistsString}
                                    </span>
                                </div>
                                <p className="mt-1 text-accent/60 font-semibold">
                                    <span className="text-accent font-bold">{songs.length} {songs.length === 1 ? "song" : songs.length === 0 ? "Playlist empty" : "songs"}</span>
                                    {horasTotales && (", "+horasTotales)} {songs.length > 0 && "aproximadamente"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>
                <header className="flex flex-row gap-8 px-6 absolute inset-0">
                    <picture className="aspect-square w-52 h-52 flex-none">
                        <img
                            src={validUrl}
                            alt={`Cover of ${playlist?.title}`}
                            className="object-cover w-full h-full shadow-lg rounded-lg"
                            style={{ viewTransitionName: `playlist-image-${id}` }}
                        />
                    </picture>

                    <div className="flex flex-col justify-between">
                        <h2 className="flex flex-1 items-end text-accent-foreground">Playlist</h2>
                        <div>
                            <h1 className="text-5xl font-bold block text-accent-foreground">
                                <span style={{ viewTransitionName: `playlist-title-${id}` }}>
                                    {playlist?.title}
                                </span>
                            </h1>
                        </div>

                        <div className="flex-1 flex items-end">
                            <div className="text-sm text-accent-foreground font-medium">
                                <div className="truncate max-w-96">
                                    <span style={{ viewTransitionName: `playlist-subtitle-${id}` }}>
                                        {artistsString}
                                    </span>
                                </div>
                                <p className="mt-1 text-accent-foreground/60 font-semibold">
                                    <span className="text-accent-foreground font-bold">{songs.length} {songs.length === 1 ? "song" : songs.length === 0 ? "Playlist empty" : "songs"}</span>
                                    {horasTotales && (", "+horasTotales)} {songs.length > 0 && "aproximadamente"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>
                </div>
                <div className="px-6 pt-6 flex items-center justify-between">
                    <Button
                        onClick={() => {
                            if(currentPlaylist?.id === playlist.id){
                                togglePlay()
                                return
                            }
                            generatePlayQueue(songs[0], playlist)
                            loadAndPlay(songs[0])
                        }} 
                        size={"icon"}
                    >
                        {currentPlaylist?.id === playlist.id && isPlaying ? <Pause className="fill-primary-foreground" /> : <Play className="fill-primary-foreground" />}
                    </Button>
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

                <section>
                    <MusicTable songs={filteredSongs} playlist={playlist} />
                </section>
            </div>
        </div>
    )
}
