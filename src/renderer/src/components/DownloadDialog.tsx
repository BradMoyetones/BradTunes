import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogCancel 
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowDownToLine } from "lucide-react";
import Spinner from "./Spinner";
import { SongFull } from "@/types/data";
import { usePlayer } from "@/contexts/PlayerProvider";
import { useData } from "@/contexts/DataProvider";

interface DownloadDialogProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export default function DownloadDialog({ isOpen, setIsOpen }: DownloadDialogProps) {
    const [url, setUrl] = useState("");
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [status, setStatus] = useState("");
    const player = usePlayer()
    const {setSongs} = useData()

    const [seeMoreError, setSeeMoreError] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const statusRef = useRef<HTMLParagraphElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleButtonClick = useCallback(() => {
        const handleDownload = async () => {
            setLoadingDownload(true);
            try {
                setStatus("Downloading...");
                const newSong: SongFull = await window.api.downloadSong(url);
                setStatus("Download complete");
                console.log(newSong);

                // Establecer la canción en currentMusic solo si playlist es null
                if (player.currentMusic.playlist === null) {
                    player.setCurrentMusic({
                        playlist: null,
                        song: player.currentMusic.song,
                        songs: [...player.currentMusic.songs, newSong], // Solo esta canción en la lista
                    });
                }

                setSongs((prev) => [...prev, newSong])
            } catch (error) {
                if (error instanceof Error) {
                    setStatus("Error: " + error.message);
                } else {
                    setStatus("Error: An unknown error occurred");
                }
            } finally {
                setLoadingDownload(false);
            }
        };
        handleDownload();
    }, [url, setIsOpen]);

    const handleSeeMoreClick = () => {
        setSeeMoreError((prev) => !prev);
    };

    // Detect if the status text is truncated
    useEffect(() => {
        const element = statusRef.current;
        if (element) {
            setIsTruncated(element.scrollHeight > element.offsetHeight);
        }
    }, [status]);

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Download media from URL</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter the URL of the song you want to download.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4">
                    <Input 
                        type="text" 
                        placeholder="Enter URL" 
                        value={url}
                        onChange={handleInputChange}
                    />
                    <div>
                        <p
                            ref={statusRef}
                            className={`text-sm text-zinc-400 transition-all duration-300 ${
                                seeMoreError ? "" : "line-clamp-2"
                            }`}
                        >
                            {status}
                        </p>
                        {isTruncated && (
                            <Button variant={"link"} onClick={handleSeeMoreClick}>
                                {seeMoreError ? "See less..." : "See more..."}
                            </Button>
                        )}
                    </div>
                </div>
                <AlertDialogFooter>
                    <Button 
                        onClick={handleButtonClick} 
                        disabled={loadingDownload || !url}
                        className="flex items-center gap-2"
                    >
                        {loadingDownload ? (
                            <Spinner />
                        ) : (
                            <>
                                Download <ArrowDownToLine size={18} />
                            </>
                        )}
                    </Button>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
