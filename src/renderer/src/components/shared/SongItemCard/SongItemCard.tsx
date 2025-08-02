import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Disc3, Download, List, Music2, Pause, Pen, Play, Search, Trash2, Video } from "lucide-react";
import { Link, useViewTransitionState } from "react-router";
import { useMusicPathStore } from "@/store";
import { Card } from "@/components/ui/card";
import { handleDownloadMedia } from "@/components/handleDownloadMP3";
import { Song } from "@core/types/data";
import { usePlayerController } from "@/contexts";
import { Button } from "@/components/ui/button";
import { MusicVisualizer } from "../MusicVisualizer";

interface PlayListItemCardProps {
  song: Song;
}

export function SongItemCard({ song }: PlayListItemCardProps) {
  const { id, title, image, artist } = song
  const href = `/song/${id}`;
  const isTransitioning = useViewTransitionState(href);
  const { musicPath } = useMusicPathStore();
  const {generatePlayQueue, isSameSong, isPlaying} = usePlayerController()
  
  const handleMouseMove = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = evt;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    const yRotation = ((x - width / 2) / width) * 20;
    const xRotation = ((y - height / 2) / height) * 20;

    const transformString = `
        perspective(500px)
        scale(1.1)
        rotateX(${xRotation}deg)
        rotateY(${yRotation}deg)
    `;

    currentTarget.style.zIndex = "50";
    currentTarget.style.transform = transformString;
  };

  const handleMouseOut = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { currentTarget } = evt;

    currentTarget.style.zIndex = "";
    currentTarget.style.transform = `
        perspective(500px)
        scale(1)
        rotateX(0)
        rotateY(0)
    `;
  };

  const isPlay = isSameSong(song) && isPlaying

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}
          className={`group relative shadow-lg hover:shadow-xl  rounded-md ransi transition-all duration-300 overflow-hidden reflex py-0`}
          style={{ transition: "box-shadow .1s, transform .1s, background-color .1s", viewTransitionName: isTransitioning ? `box-song-${id}` : "none", }}
        >
          <div
            className="absolute right-4 bottom-20 translate-y-4
              transition-all duration-200 
              group-hover:translate-y-0 group-hover:opacity-100
              z-10"
          >
            <Button onClick={() => generatePlayQueue(song)} className="flex items-center justify-center rounded-full" size={"icon"}>
              {isPlay ? <Pause className="fill-primary-foreground" /> : <Play className="fill-primary-foreground" />}
            </Button>
          </div>

          <div
            className={`flex relative p-2 gap-2 pb-3 rounded-md w-44 flex-col`}
          >
              <picture className={`aspect-square w-40 h-40 flex-none`}>
                <img
                  src={`safe-file://${musicPath}/img/${image}`}
                  alt={`Cover of ${title} by ${artist}`}
                  className="object-cover w-full h-full rounded-md object-center" 
                  style={{
                    viewTransitionName: isTransitioning
                      ? `song-image-${id}`
                      : "none",
                  }}
                />
              </picture>

              <div className="flex flex-auto flex-col px-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {isPlay && (
                      <MusicVisualizer numBars={5} width={20} height={18} />
                    )}
                  </div>
                  <h4 
                    className={`${isPlay && "text-primary"} text-sm truncate font-semibold`}
                    style={{
                      viewTransitionName: isTransitioning
                        ? `song-title-${id}`
                        : "none",
                    }}
                  >
                    {title}
                  </h4>
                </div>

                <span
                  className="text-xs text-muted-foreground truncate"
                  style={{
                    viewTransitionName: isTransitioning
                      ? `song-artist-${id}`
                      : "none",
                  }}
                >
                  {artist}
                </span>
              </div>
          </div>
        </Card>
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
              {/* <Input className="h-7" onChange={(query) => setSearchQuery(query.target.value)} /> */}
            </ContextMenuLabel>
            <ContextMenuSeparator />
            {/* {filteredData.length > 0 ? filteredData.map(playlist => (
              <ContextMenuCheckboxItem 
                key={playlist.id+"add-to-playlist"}
                onClick={() => addMusicToPlaylist(song, playlist, currentMusic, setCurrentMusic, setPlaylists, setSongs)}
                disabled={song.playlist_songs.some(ps => ps.playlist_id === playlist.id)}
                checked={song.playlist_songs.some(ps => ps.playlist_id === playlist.id)}
              >
                <span className="sr-only">Word</span>
                {playlist.title}
              </ContextMenuCheckboxItem>
            )): (
              <ContextMenuLabel className="flex items-center">
                <span className="text-gray-400">No results found</span>
              </ContextMenuLabel>
            )} */}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <Link 
            to={href}
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
}