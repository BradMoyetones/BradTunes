import SideMenuItem from "./SideMenuItem";
import HomeIcon from "@/icons/Home"
import SearchIcon from "@/icons/Search"
import LibraryIcon from "@/icons/Library"
import SideMenuCard from "./SideMenuCard";
import DownloadDialog from "./DownloadDialog";
import { useState } from "react";
import { AlertCircle, Cog, Plus, Youtube } from "lucide-react";
import PlaylistDialog from "./PlaylistDialog";
import { Button } from "./ui/button";
import { useData } from "@/contexts/DataProvider";
import { useLastVisitedPath } from "@/hooks/useLastVisitedPath";
import { useVersion } from "@/contexts/VersionContext";
import { useMusicPath } from "@/contexts/MusicPathProvider";

export default function AsideMenu() {
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
    const [ isOpen, setIsOpen ] = useState(false);
    const { playlists } = useData()
    const { navigateToLastPath } = useLastVisitedPath("/settings");
    const { versionInfo, appVersion } = useVersion()
    const { defaultPath } = useMusicPath();

    function openYoutube() {
        window.api.createNewWindow('https://www.youtube.com/')
    }

    return (
        <nav className="flex flex-col flex-1 gap-2">
            <div className="bg-slate-200 dark:bg-zinc-900 rounded-lg p-2">
                <ul className="relative">
                    <SideMenuItem to="/" id="homeButton">
                        <HomeIcon />
                        Home
                    </SideMenuItem>
                    

                    <SideMenuItem onClick={() => setIsDownloadDialogOpen(true)} id="downloadButton">
                        <SearchIcon />
                        Download
                    </SideMenuItem>

                    <SideMenuItem onClick={() => openYoutube()} id="youtubeButton">
                        <Youtube />
                        YouTube
                    </SideMenuItem>

                    <SideMenuItem onClick={navigateToLastPath} id="settingsButton">
                        <div className="relative">
                            {(versionInfo?.newVersion || appVersion?.newVersion || defaultPath) && (
                                <span className="absolute w-3 h-3 bg-yellow-400 rounded-full -top-1 -right-1 animate-pulse"></span>
                            )}
                            <Cog />
                        </div>
                        Settings
                    </SideMenuItem>

                    <DownloadDialog 
                        isOpen={isDownloadDialogOpen} 
                        setIsOpen={setIsDownloadDialogOpen} 
                    />
                </ul>
            </div>

            <div className="bg-slate-200 dark:bg-zinc-900 rounded-lg p-2 flex-1 relative">
                <Button
                    className="absolute top-3.5 right-4 rounded-full" 
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => setIsOpen(!isOpen)} 
                    id="buttonPlaylist"
                >
                    <Plus />
                    <span className="sr-only">Create Playlist</span>
                </Button>
                <ul>
                    <SideMenuItem to="/">
                        <LibraryIcon />
                        Your Library
                    </SideMenuItem>

                    {playlists.length > 0 ? playlists.map((playlist) => <SideMenuCard key={`Playlist-card-${playlist.id}`} playlist={playlist} />) : (
                        <div className="flex flex-col justify-center items-center py-10 text-muted-foreground">
                            <AlertCircle />
                            <p>
                                No playlists found
                            </p>
                        </div>
                    )}
                </ul>
            </div>
            <PlaylistDialog setIsOpen={setIsOpen} isOpen={isOpen} />
        </nav>
    )
}
