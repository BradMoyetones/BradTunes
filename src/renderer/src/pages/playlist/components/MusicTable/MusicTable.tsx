import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MusicTableProps } from "./MusicTable.types"
import { Clock, Disc3, Download, List, Music2, Pause, Pen, Play, Trash2, Video } from "lucide-react"
import { SongFull } from "@core/types/data"
import { formatTime } from "@/utils/time"
import { formatDate } from "@/lib/helpers"
import { useData, useMusicPath, usePlayerController } from "@/contexts"
import { MusicVisualizer } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import Search from "@/icons/Search"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { handleDownloadMedia } from "@/components/handleDownloadMP3"
import { useMemo, useState } from "react"
import usePlaylistMusicActions from "@/hooks/usePlaylistMusicActions"

export function MusicTable({songs, playlist}: MusicTableProps) {
    const {musicPath} = useMusicPath()
    const {generatePlayQueue, isSameSong, isPlaying, togglePlay, loadAndPlay} = usePlayerController()
    const playlistSong = (song: SongFull) => song.playlist_songs.find(value => value.playlistId === playlist.id)
    const {playlists, songs: songsContext, setPlaylists, setSongs} = useData()
    const {addMusicToPlaylist, removeMusicFromPlaylist} = usePlaylistMusicActions({
        playlists, 
        songs: songsContext, 
        setSongs, 
        setPlaylists
    })
    const [query, setQuery] = useState("")
    
    const filteredData = useMemo(() => {
        return playlists.filter(s =>
          s.title.toLowerCase().includes(query.toLowerCase().trim())
        );
    }, [playlists, query]);

    return (
        <div className="@container/main overflow-x-auto">
            <Table>
                <TableCaption>A list of your songs added.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16 text-center">#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Reproductions</TableHead>
                        <TableHead className="text-right"><Clock /></TableHead>
                        <TableHead className="text-right">Added</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                        {songs.map((song, i) => {
                            const added = playlistSong(song)?.date
                            const isPlay = isSameSong(song, playlist)

                            return (
                                <ContextMenu key={song.id+"-item-row"}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow 
                                            onDoubleClick={() => {
                                                if(isPlay){
                                                    togglePlay()
                                                }else {
                                                    generatePlayQueue(song, playlist)
                                                    loadAndPlay(song)
                                                }
                                            }}
                                            className="group"
                                        >
                                            <TableCell className="font-medium text-center">
                                                <div className="w-fit mx-auto h-fit flex items-center">
                                                    {isPlay && isPlaying ? (
                                                        <MusicVisualizer numBars={5} width={20} height={18} className="group-hover:hidden mx-auto" />
                                                    ):(
                                                        <span className="group-hover:invisible">
                                                            {i + 1}
                                                        </span>
                                                    )}

                                                    <Button 
                                                        onClick={() => {
                                                            if(isPlay){
                                                                togglePlay()
                                                            }else {
                                                                generatePlayQueue(song, playlist)
                                                                loadAndPlay(song)
                                                            }
                                                        }} 
                                                        variant={"outline"}
                                                        className="items-center justify-center rounded-full hidden group-hover:flex" 
                                                        size={"icon"}
                                                    >
                                                        {isPlay && isPlaying ? <Pause className="fill-primary" /> : <Play className="fill-primary" />}
                                                    </Button>
                                                    
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4 w-fit">
                                                    <img 
                                                        src={`safe-file://${musicPath}/img/${song.image}`}
                                                        className="size-12 rounded-sm object-cover object-center"
                                                        alt={`Cover for ${song.title}`}
                                                    />
                                                    <div className="relative overflow-hidden">
                                                        {isPlay && isPlaying ? (
                                                            <h1 className="text-primary w-fit">{song.title}</h1>
                                                        ): (
                                                            <h1>{song.title}</h1>
                                                        )}
                                                        <p className="text-muted-foreground w-fit">{song.artist}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{song.reproductions}</TableCell>
                                            <TableCell>{formatTime(song.duration)}</TableCell>
                                            <TableCell className="text-right">{formatDate(added || null)}</TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-64">
                                        <ContextMenuSub>
                                            <ContextMenuSubTrigger>
                                                <List className="mr-2 h-4 w-4" />
                                                <span>Add to play list</span>
                                            </ContextMenuSubTrigger>
                                            <ContextMenuSubContent className="w-48">
                                                <ContextMenuLabel className="flex items-center">
                                                    <Search className="mr-2 h-4 w-4 flex-none" />
                                                    <Input className="h-7" onChange={(query) => setQuery(query.target.value)} />
                                                </ContextMenuLabel>
                                                <ContextMenuSeparator />
                                                {filteredData.length > 0 ? filteredData.map(playlist => (
                                                    <ContextMenuCheckboxItem 
                                                        key={playlist.id+"add-to-playlist"}
                                                        onClick={() => addMusicToPlaylist({song, playlist})}
                                                        disabled={song.playlist_songs.some(ps => ps.playlistId === playlist.id)}
                                                        checked={song.playlist_songs.some(ps => ps.playlistId === playlist.id)}
                                                    >
                                                        <span className="sr-only">Word</span>
                                                        {playlist.title}
                                                    </ContextMenuCheckboxItem>
                                                )): (
                                                    <ContextMenuLabel className="flex items-center">
                                                        <span className="text-gray-400">No results found</span>
                                                    </ContextMenuLabel>
                                                )}
                                            </ContextMenuSubContent>
                                        </ContextMenuSub>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem asChild>
                                            <Link 
                                                to={`/song/${song.id}`}
                                                viewTransition
                                            >
                                                <Pen className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </ContextMenuItem>
                                        <ContextMenuItem 
                                            className="text-destructive hover:!text-destructive"
                                            onClick={() => {removeMusicFromPlaylist({song, playlist})}}
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
                                                <ContextMenuItem 
                                                    onClick={() => handleDownloadMedia(song, "mp3", musicPath)}
                                                >
                                                    <Music2 className="mr-2 h-4 w-4" />
                                                    MP3
                                                </ContextMenuItem>
                                                <ContextMenuItem 
                                                    onClick={() => handleDownloadMedia(song, "mp4", musicPath)}
                                                >
                                                    <Video className="mr-2 h-4 w-4" />
                                                    MP4
                                                </ContextMenuItem>
                                            </ContextMenuSubContent>
                                        </ContextMenuSub>
                                    </ContextMenuContent>
                                </ContextMenu>
                            )
                        })}
                </TableBody>
            </Table>
        </div>
    )
}
