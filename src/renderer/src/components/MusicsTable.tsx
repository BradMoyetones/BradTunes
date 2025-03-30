
import {TimeIcon} from "@/icons/MusicsTableIcons"
import { PlaylistsFull, PlaylistSongsFull, SongFull } from "@/types/data";
import { filterData } from "@/lib/helpers";
import { useState } from "react";
import { useData } from "@/contexts/DataProvider";
import { usePlayer } from "@/contexts/PlayerProvider";
import { usePlayerManager } from "@/contexts/PlayerManagerContext";
import MusicTableItem from "./MusicTableItem";

interface Props {
  songs: SongFull[],
  playlist: PlaylistsFull | null
  deleteSong: (songId: number) => void
  addSongToPlaylist: (songId: number, data: PlaylistSongsFull) => void
}

export const MusicsTable = ({songs, playlist, deleteSong, addSongToPlaylist}: Props) => {
  const { playlists } = useData()
  const { currentMusic } = usePlayer()
  const [searchQuery, setSearchQuery] = useState("");
  const player = usePlayerManager()
  
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
            return (
              <MusicTableItem 
                key={`{song.albumId}-${song.id}`} 
                filteredData={filteredData} 
                song={song} 
                index={index} 
                isCurrentSong={isCurrentSong} 
                playlist={playlist} 
                setSearchQuery={setSearchQuery} 
                deleteSong={deleteSong}
                addSongToPlaylist={addSongToPlaylist}
              />
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
