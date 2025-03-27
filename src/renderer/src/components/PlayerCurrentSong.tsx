import { useMusicPath } from "@/contexts/MusicPathProvider";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";
import { Link } from "react-router";

interface PlayerCurrentSongProps {
  id?: number;
  image?: string;
  title?: string;
  artist?: string;
}

export const PlayerCurrentSong = ({image, title, artist, id}: PlayerCurrentSongProps) => {
  const { isFullScreen } = useVideoFullScreen()
  const { musicPath } = useMusicPath();
  
  return (
    <div
      className={`
        flex items-center gap-5 relative
        overflow-hidden
      `}>
      { image ?
        (
          <picture className="!w-[70px] !h-[70px] mb-2 aspect-square bg-zinc-800 rounded-md shadow-lg overflow-hidden flex">
            <img src={`safe-file://${musicPath}/img/${image}`} alt={title} className="w-full h-full object-cover object-center"/>
          </picture>
        ): (
          <picture className="w-16 h-16 aspect-square bg-zinc-800 rounded-md shadow-lg overflow-hidden">
            <img src={"img/liked-songs-64.png"} alt={"No song"} className="object-cover object-center"/>
          </picture>
        )
      }
      <div className="flex flex-col max-w-[200px] w-full">
        <Link to={`/video/${id}`} viewTransition>
          <h3 className="font-semibold text-sm block truncate hover:underline text-primary">
            {title ?? "No current song"}
          </h3>
        </Link>
        <span className={`text-xs opacity-80 truncate ${isFullScreen ? "text-white" : ""}`}>
          {artist ?? "No artist"}
        </span>
      </div>

    </div>
  )
}