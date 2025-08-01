import SideMenuItem from "../../../../components/SideMenuItem";
import HomeIcon from "@/icons/Home"
import LibraryIcon from "@/icons/Library"
import SideMenuCard from "../../../../components/SideMenuCard";
import { useState } from "react";
import { AlertCircle, Cog, Download, Plus, Youtube } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useLastVisitedPath } from "@/hooks/useLastVisitedPath";
import { Card } from "../../../../components/ui/card";
import { useData, useMusicPath, useVersion } from "@/contexts";
import { DownloadDialog, PlaylistDialog } from "../../../../components/shared";

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
            <Card className="rounded-lg p-2 bg-background">
                <ul className="relative">
                    <SideMenuItem to="/" id="homeButton">
                        <HomeIcon />
                        Home
                    </SideMenuItem>
                    

                    <SideMenuItem onClick={() => setIsDownloadDialogOpen(true)} id="downloadButton">
                        <Download />
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
            </Card>

            <Card className="rounded-lg p-2 flex-1 relative bg-background">
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

                    {/* {playlists.length > 0 ? playlists.map((playlist) => <SideMenuCard key={`Playlist-card-${playlist.id}`} playlist={playlist} />) : (
                        <div className="flex flex-col justify-center items-center py-10 text-muted-foreground">
                            <AlertCircle />
                            <p>
                                No playlists found
                            </p>
                        </div>
                    )} */}
                </ul>
            </Card>
            <PlaylistDialog setIsOpen={setIsOpen} isOpen={isOpen} />
        </nav>
    )
}
