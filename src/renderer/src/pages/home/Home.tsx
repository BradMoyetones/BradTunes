import Greeting from "@/components/Greeting";
import PlayListItemCard2 from "@/components/PlayListItemCard";
import SongItemCard from "@/components/SongItemCard";
import { useData } from "@/contexts/DataProvider";
import { AlertCircle } from "lucide-react";

export default function Home() {
    const { playlists, songs } = useData();

    return (
        <div
            id="playlist-container"
            className="relative transition-all duration-1000 bg-primary rounded-lg"
        >
            <div className="relative z-10 px-6 pt-10 pb-6">
                <Greeting />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4 mt-10">
                    {playlists.map((playlist) => <PlayListItemCard2 key={`playlist-card-${playlist.id}`} playlist={playlist} />)}
                </div>

                <div className="flex flex-wrap mt-6 gap-4">
                    {songs.length > 0 ? songs.map((song) => (
                        <SongItemCard key={`Sound-card-${song.id}`} song={song} />
                    )): (
                        <div className="flex flex-col text-muted-foreground py-10 items-center justify-center w-full">
                            <AlertCircle />
                            <p>
                                No songs found
                            </p>
                        </div>
                    )}
                </div>
                <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-200 via-slate-200/80 dark:from-zinc-900 dark:via-zinc-900/80 -z-[1]"
                >
                </div>
            </div>
        </div>
    )
}
