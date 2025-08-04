import Greeting from "@/components/Greeting";
import PlayListItemCard2 from "@/components/PlayListItemCard";
import { SongItemCard } from "@/components/shared";
import { useData } from "@/contexts";
import { AlertCircle } from "lucide-react";

export default function Home() {
    const { playlists, songs } = useData();

    return (
        <div
            id="playlist-container"
            className="relative transition-all duration-1000  rounded-lg"
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
                        <div className="flex flex-col gap-2 text-primary-foreground py-10 items-center justify-center w-full">
                            <AlertCircle />
                            <p>
                                No songs found
                            </p>
                        </div>
                    )}
                </div>
                <div
                    className="absolute top-0 left-0 right-0 h-[80vh] bg-gradient-to-b from-primary via-primary/50  -z-[1]"
                >
                </div>
            </div>
        </div>
    )
}
