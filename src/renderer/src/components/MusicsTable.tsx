
import {TimeIcon} from "@/icons/MusicsTableIcons"
import {MusicsTablePlay} from "@/components/MusicsTablePlay"
import { PlaylistsFull, SongFull } from "@/types/data";
import { filterData, formatDate } from "@/lib/helpers";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Disc3, Download, List, Music2, Pen, Search, Trash2, Video } from "lucide-react";
import { handleDownloadMedia } from "./handleDownloadMP3";
import { Input } from "./ui/input";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useData } from "@/contexts/DataProvider";
import MusicVisualizer from "./MusicVisualizer";
import { usePlayer } from "@/contexts/PlayerProvider";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import { useMusicPathStore } from "@/store/useMusicPathStore";

interface Props {
  songs: SongFull[],
  playlist: PlaylistsFull | null
}

export const MusicsTable = ({songs, playlist}: Props) => {
  const { playlists } = useData()
  const { currentMusic } = usePlayer()
  const [searchQuery, setSearchQuery] = useState("");
  const player = usePlayerManager()
  const { id } = useParams<{ id: string }>();
  const { musicPath } = useMusicPathStore();
  
  if(!playlist) return

  const isCurrentSong = (songId: number) => {
    return currentMusic.song?.id === songId && currentMusic.playlist?.id === playlist.id && !player.audioRef.paused
  }
  
  // Filtrar y limitar los resultados según el `searchQuery` y `maxLimit`
  const filteredData = filterData(searchQuery, playlists).slice(
    0,
    100
  );
  return (
    <table className="table-auto text-left min-w-full divide-y divide-gray-500/20">
      <thead className="">
      <tr className="text-zinc-600 dark:text-zinc-400 text-sm">
        <th className="px-4 py-2 font-light">#</th>
        <th className="px-4 py-2 font-light">Title</th>
        <th className="px-4 py-2 font-light">Reproductions</th>
        <th className="px-4 py-2 font-light"><TimeIcon /></th>
        <th className="px-4 py-2 font-light">Added</th>
      </tr>
      </thead>

      <tbody>
      <tr className="h-[16px]"></tr>
      {songs.length > 0 ?
        songs.map((song, index) => {
            const played = isCurrentSong(song.id)
            return (
              <ContextMenu key={`{song.albumId}-${song.id}`}>
                <ContextMenuTrigger asChild>
                  <tr
                    className="text-zinc-600 dark:text-gray-300 border-spacing-0 text-sm font-light hover:bg-white/10 overflow-hidden transition duration-300 group"
                    onDoubleClick={() => {
                      const sanitizedPlaylist = { ...playlist, playlist_songs: [] };
                      player.changePlaylistAndSong(sanitizedPlaylist, song);
                    }}
                    style={{
                      viewTransitionName: `box-song-${song.id}`
                    }}
                  >
                    <td className="relative px-4 py-2 rounded-tl-lg rounded-bl-lg w-5">
                      <span className="absolute top-5 opacity-100 transition-all group-hover:opacity-0">
                        {!played ? index + 1 : (
                          <MusicVisualizer numBars={5} width={20} height={18} />
                        )}
                      </span>
                      <div className="absolute top-[18px] opacity-0 transition-all group-hover:opacity-100">
                        <MusicsTablePlay playlist={playlist} isCurrentSong={isCurrentSong(song.id)} song={song} />
                      </div>
                    </td>
                    <td className="px-4 py-2 flex gap-3">
                      <picture className="">
                        <img 
                          src={`safe-file://${musicPath}/img/${song.image}`}
                          alt={song.title} 
                          className="w-11 h-11 object-cover object-center rounded-md"
                          style={{
                            viewTransitionName: `song-image-${song.id}`
                          }}
                        />
                      </picture>
                      <div className="flex flex-col">
                        <h3 
                          className={
                            `text-base font-semibold
                            ${played ? "text-primary" : "text-zinc-900 dark:text-white"}
                            `
                          }
                          style={{
                            viewTransitionName: `song-title-${song.id}`
                          }}
                        >{song.title}</h3>
                        <span
                          className="text-muted-foreground"
                          style={{
                            viewTransitionName: `song-artist-${song.id}`
                          }}
                        >{song.artist}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{song.reproductions}</td>
                    <td 
                      className="px-4 py-2"
                      style={{
                        viewTransitionName: `song-duration-${song.id}`
                      }}
                    >{song.duration}</td>
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
                      {filteredData.length > 0 ? filteredData.map(playlist => (
                        <ContextMenuCheckboxItem
                          key={playlist.id}
                          disabled={playlist.id == song.playlist_songs[0].playlist_id}
                          checked={playlist.id == song.playlist_songs[0].playlist_id}
                        >
                          {playlist.title}
                        </ContextMenuCheckboxItem>
                      )):(
                        <ContextMenuLabel className="flex items-center">
                          <span className="text-gray-400">No results found</span>
                        </ContextMenuLabel>
                      )}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator />
                  <ContextMenuItem asChild>
                    <Link 
                      to={`/song/${song.id}/${id}`}
                      viewTransition
                    >
                      <Pen className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </ContextMenuItem>
                  <ContextMenuItem className="text-destructive hover:!text-destructive">
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
                          onClick={() => handleDownloadMedia(song, "mp3")}
                        >
                          <Music2 className="mr-2 h-4 w-4" />
                          MP3
                        </ContextMenuItem>
                        <ContextMenuItem 
                          onClick={() => handleDownloadMedia(song, "mp4")}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          MP4
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                </ContextMenuContent>
              </ContextMenu>
            )
          }
        ): (
          <tr
            className="text-gray-300 border-spacing-0 text-sm font-light hover:bg-white/10 overflow-hidden transition duration-300 group"
          >
            <td colSpan={20} className="text-muted-foreground text-center p-4">No songs found</td>
          </tr>
        )
      }
      </tbody>
    </table>
  );
}
