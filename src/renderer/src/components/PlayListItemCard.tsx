import { PlaylistsFull } from '@/types/data';
import { Link } from 'react-router';

interface PlayListItemCardProps {
  playlist: PlaylistsFull;
}

export default function PlayListItemCard2({ playlist }: PlayListItemCardProps) {
    const { id, cover, title, playlist_songs } = playlist
    const artistsString = playlist_songs.length > 0 ? playlist_songs.map(e => e.song.artist).join(", ") : "No artists found"

    return (
        <Link 
            key={playlist.id+"cardmix"}
            to={`/playlist/${id}`}
            className="col-span-1 flex items-center rounded-sm overflow-hidden h-16 gap-4 bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
            viewTransition
            style={{ viewTransitionName: `playlist-box-${id}` }}
        >
                <>
                    <div className="rounded-sm h-full w-16 flex-none flex items-center justify-center bg-secondary">
                        <img
                            src={cover}
                            alt={`Cover of ${title} by ${artistsString}`}
                            className="w-full h-full object-cover object-center" 
                            style={{
                                viewTransitionName: `playlist-image-${id}`
                            }}
                        />
                    </div>

                    <div>
                        <h1 
                            className="font-bold truncate"
                            style={{
                                viewTransitionName: `playlist-title-${id}`
                            }}
                        >{playlist.title}</h1>
                        <span
                            className="text-xs text-zinc-600 dark:text-gray-400 truncate"
                            style={{
                                viewTransitionName: `playlist-subtitle-${id}`
                            }}
                        >
                            {artistsString}
                        </span>
                    </div>
                </>
        </Link>
    )
}
