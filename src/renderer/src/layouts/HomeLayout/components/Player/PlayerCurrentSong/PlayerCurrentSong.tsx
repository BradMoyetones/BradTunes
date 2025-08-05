import { useMusicPath, useVideoFullScreen } from "@/contexts";
import { Link } from "react-router";
import { PlayerCurrentSongProps } from "./PlayerCurrentSong.types";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export const PlayerCurrentSong = ({image, title, artist, id}: PlayerCurrentSongProps) => {
  const { isFullScreen } = useVideoFullScreen()
  const { musicPath } = useMusicPath();

  return (
    <div
      className={`
        flex items-center gap-5 relative
        overflow-hidden
        h-fit
      `}>
        <div className="h-16 w-16 aspect-square shrink-0 rounded-md shadow-lg overflow-hidden">
      { image ?
        (
          <img src={`safe-file://${musicPath}/img/${image}`} alt={title} className="w-full h-full object-cover object-center"/>
        ): (
          <img src={"img/liked-songs-64.png"} alt={"No song"} className="w-full h-full object-cover object-center"/>
        )
      }
      </div>
      <div className="flex flex-col max-w-[200px] w-full overflow-hidden group relative">
        {id ? (
          <Link to={`/video/${id}`} viewTransition>
            <InfiniteSlider
              speedOnHover={20}
              speed={40}
              gap={20}
            >
              <h3 className="font-semibold text-sm hover:underline text-primary whitespace-nowrap">
                {title ?? "No current song"}
              </h3>
            </InfiniteSlider>
            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-4 pointer-events-none"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-4 pointer-events-none"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-1"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-1"
              direction="right"
              blurIntensity={1}
            />
          </Link>
        ): (
          <h3 className="font-semibold text-sm whitespace-nowrap">
            No current song
          </h3>
        )}
        <span className={`text-xs opacity-80 truncate ${isFullScreen ? "text-white" : ""}`}>
          {artist ?? "No artist"}
        </span>
      </div>
    </div>
  )
}