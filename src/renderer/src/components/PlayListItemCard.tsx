import { useImageExists } from '@/hooks/use-image-exists';
import { useMusicPathStore } from '@/store/useMusicPathStore/useMusicPathStore';
import { Playlist } from '@core/types/data';
import { Link, useViewTransitionState } from 'react-router';

interface PlayListItemCardProps {
  playlist: Playlist;
}

export default function PlayListItemCard2({ playlist }: PlayListItemCardProps) {
    const { id, cover, title } = playlist
    const { musicPath } = useMusicPathStore();
    const href = `/playlist/${id}`;
    const isTransitioning = useViewTransitionState(href);
    
    const validUrl = useImageExists(`safe-file://${musicPath}/img/playlists/${cover}`)
    
    return (
        <Link 
            key={playlist.id+"cardmix"}
            to={href}
            className="col-span-1 flex items-center rounded-sm overflow-hidden h-16 gap-4 bg-card hover:bg-card/80 border cursor-pointer transition-colors"
            viewTransition
            style={{ viewTransitionName: `playlist-box-${id}` }}
        >
                <>
                    <div className="rounded-sm h-full w-16 flex-none flex items-center justify-center bg-secondary">
                        <img
                            src={validUrl}
                            alt={`Cover of ${title} by (COLOCAR ARTISTAS)`}
                            className="w-full h-full object-cover object-center" 
                            style={{
                                viewTransitionName: isTransitioning
                                    ? `playlist-image-${id}`
                                    : "none",
                            }}
                        />
                    </div>

                    <div>
                        <h1 
                            className="font-bold truncate"
                            style={{
                                viewTransitionName: isTransitioning
                                    ? `playlist-title-${id}`
                                    : "none",
                            }}
                        >{playlist.title}</h1>
                        <p
                            className="text-xs text-zinc-600 dark:text-gray-400 truncate max-w-32"
                            style={{
                                viewTransitionName: isTransitioning
                                    ? `playlist-subtitle-${id}`
                                    : "none",
                            }}
                        >
                            {/* {artistsString} */}
                        </p>
                    </div>
                </>
        </Link>
    )
}
