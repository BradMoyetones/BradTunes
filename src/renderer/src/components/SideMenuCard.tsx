import { NavLink } from "react-router"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useImageExists } from "@/hooks/use-image-exists";
import { PlaylistWithSongs } from "@core/types/data";
import { PlaylistDialog } from "./shared";
import { useMusicPathStore } from "@/store";

interface Props {
  playlist: PlaylistWithSongs,
  onClick?: (data: PlaylistWithSongs) => void,
}

export default function SideMenuCard({ playlist, onClick }: Props) {

  const { id, cover, title } = playlist;
  const artistsString = playlist.playlist_songs.length > 0
                    ? playlist.playlist_songs.map((e) => e.song?.artist).join(", ")
                    : "No artists found";
  const [ isOpen, setIsOpen ] = useState(false);
  const { musicPath } = useMusicPathStore();

  const [timestamp, setTimestamp] = useState(new Date().getTime())

  useEffect(() => {
    setTimestamp(new Date().getTime())
  }, [isOpen, setIsOpen])

  const validUrl = useImageExists(`safe-file://${musicPath}/img/playlists/${cover}`)
  
  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <NavLink
          to={`/playlist/${id}`}
          className="playlist-item flex relative p-2 overflow-hidden items-center gap-5 rounded-md hover:bg-white dark:hover:bg-zinc-800"
          viewTransition
        >
          <picture className="h-12 w-12 flex-none">
            <img
              src={validUrl}
              alt={`Cover of ${title}`}
              className="object-cover w-full h-full rounded-md"
            />
          </picture>

          <div className="flex flex-auto flex-col truncate">
            <h4 className="text-sm">
              {title}
            </h4>

            <span className="text-xs text-muted-foreground">
              {artistsString}
            </span>
          </div>
        </NavLink>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Label */}
        <ContextMenuLabel>
          Options for playlist
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => {
            if (onClick) {
              onClick(playlist)
            }
            if (setIsOpen) {
              setIsOpen(true)
            }
          }}
        >
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem className="text-destructive hover:!text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    <ContextMenu />
    <PlaylistDialog key={timestamp} setIsOpen={setIsOpen} isOpen={isOpen} data={playlist} />
    </>
  )
}


