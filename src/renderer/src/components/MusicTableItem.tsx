import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger, ContextMenuCheckboxItem } from "@/components/ui/context-menu";
import { Music2, Pen, Trash2, Download, List, Search, Disc3, Video } from "lucide-react";
import { Link, useViewTransitionState } from "react-router-dom";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { useMusicPathStore } from "@/store/useMusicPathStore";
import { formatDate } from "@/lib/helpers";
import { MusicsTablePlay } from "./MusicsTablePlay";
import { handleDownloadMedia } from "./handleDownloadMP3";
import MusicVisualizer from "./MusicVisualizer";
import { PlaylistsFull, PlaylistSongsFull, SongFull } from "@/types/data";
import { Input } from "./ui/input";
import addMusicToPlaylist from "./AddMusicToPlaylist";
import { usePlayer } from "@/contexts/PlayerProvider";
import { useData } from "@/contexts/DataProvider";
import deletePlaylistSong from "./DeletePlaylistSong";

interface SongItemProps {
    song: SongFull; // Define el tipo correctamente
    index: number;
    playlist: PlaylistsFull; // Define el tipo correctamente
    isCurrentSong: (id: number) => boolean;
    filteredData: any[]; // Define el tipo correctamente
    setSearchQuery: (query: string) => void;
    deleteSong: (songId: number) => void;
    addSongToPlaylist: (songId: number, data: PlaylistSongsFull) => void;
}

const MusicTableItem = ({
    song,
    index,
    playlist,
    isCurrentSong,
    filteredData,
    setSearchQuery,
    deleteSong,
    addSongToPlaylist
}: SongItemProps) => {
    const played = isCurrentSong(song.id);
    const player = usePlayerManager()
    const { musicPath } = useMusicPathStore();
    const { id, title, image, artist, duration } = song
    const href = `/song/${id}/${playlist.id}`;
    const isTransitioning = useViewTransitionState(href);
    const { currentMusic, setCurrentMusic } = usePlayer();
    const { playlists, songs, setPlaylists, setSongs } = useData()

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <tr
                    className="text-zinc-600 dark:text-gray-300 border-spacing-0 text-sm font-light hover:bg-white/10 overflow-hidden transition duration-300 group"
                    onDoubleClick={() => {
                        const sanitizedPlaylist = { ...playlist, playlist_songs: [] };
                        player.changePlaylistAndSong(sanitizedPlaylist, song);
                    }}
                    style={{
                        viewTransitionName: isTransitioning ? `box-song-${id}` : "none"
                    }}
                >
                    <td className="relative px-4 py-2 rounded-tl-lg rounded-bl-lg w-5">
                        <span className="absolute top-5 opacity-100 transition-all group-hover:opacity-0">
                            {!played ? index + 1 : (
                                <MusicVisualizer numBars={5} width={20} height={18} />
                            )}
                        </span>
                        <div className="absolute top-[18px] opacity-0 transition-all group-hover:opacity-100">
                            <MusicsTablePlay playlist={playlist} isCurrentSong={played} song={song} />
                        </div>
                    </td>
                    <td className="px-4 py-2 flex gap-3">
                        <picture>
                            <img
                                src={`safe-file://${musicPath}/img/${image}`}
                                alt={title}
                                className="w-11 h-11 object-cover object-center rounded-md"
                                style={{
                                    viewTransitionName: isTransitioning
                                      ? `song-image-${id}`
                                      : "none",
                                }}
                            />
                        </picture>
                        <div className="flex flex-col">
                            <h3
                                className={`text-base font-semibold ${played ? "text-primary" : "text-zinc-900 dark:text-white"}`}
                                style={{
                                    viewTransitionName: isTransitioning
                                      ? `song-title-${id}`
                                      : "none",
                                }}
                            >
                                {title}
                            </h3>
                            <span 
                                className="text-muted-foreground" 
                                style={{
                                    viewTransitionName: isTransitioning
                                      ? `song-artist-${id}`
                                      : "none",
                                }}
                            >
                                {artist}
                            </span>
                        </div>
                    </td>
                    <td className="px-4 py-2">{song.reproductions}</td>
                    <td 
                        className="px-4 py-2" 
                        style={{
                            viewTransitionName: isTransitioning
                              ? `song-duration-${id}`
                              : "none",
                        }}
                    >
                        {duration}
                    </td>
                    <td className="px-4 py-2 rounded-tr-lg rounded-br-lg">{formatDate(song.playlist_songs[0].date)}</td>
                </tr>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <List className="mr-2 h-4 w-4" />
                        <span>Add to play list</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48 max-h-96 overflow-auto">
                        <ContextMenuLabel className="flex items-center">
                            <Search className="mr-2 h-4 w-4 flex-none" />
                            <Input className="h-7" onChange={(query) => setSearchQuery(query.target.value)} />
                        </ContextMenuLabel>
                        <ContextMenuSeparator />
                            {filteredData.length > 0 ? (
                                filteredData.map((playlistFil) => (
                                    <ContextMenuCheckboxItem
                                        key={playlistFil.id + "context-table"}
                                        disabled={song.playlist_songs.some(ps => ps.playlist_id === playlistFil.id)}
                                        checked={song.playlist_songs.some(ps => ps.playlist_id === playlistFil.id)}
                                        onClick={() => addMusicToPlaylist(song, playlistFil, currentMusic, setCurrentMusic, setPlaylists, setSongs, addSongToPlaylist)}
                                    >
                                        {playlistFil.title}
                                    </ContextMenuCheckboxItem>
                                ))
                            ) : (
                                <ContextMenuLabel className="flex items-center">
                                    <span className="text-gray-400">No results found</span>
                                </ContextMenuLabel>
                            )}
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem asChild>
                    <Link to={`/song/${song.id}/${playlist.id}`} viewTransition>
                        <Pen className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </ContextMenuItem>
                <ContextMenuItem 
                    className="text-destructive hover:!text-destructive"
                    onClick={() => deletePlaylistSong(song, playlist, playlists, songs, setSongs, setPlaylists, deleteSong)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="!text-sky-600 hover:!text-sky-600">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuLabel className="flex items-center">
                            <Disc3 className="mr-2 h-4 w-4" />
                            Format
                        </ContextMenuLabel>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => handleDownloadMedia(song, "mp3")}>
                            <Music2 className="mr-2 h-4 w-4" />
                            MP3
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleDownloadMedia(song, "mp4")}>
                            <Video className="mr-2 h-4 w-4" />
                            MP4
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default MusicTableItem;
