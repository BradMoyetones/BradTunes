import AsideMenu from "@/components/AsideMenu";
import Player from "@/components/Player";
import { VideoFullScreenProvider } from "@/contexts/VideoFullScreenContext";
import { driver } from "driver.js";
import JSConfetti from "js-confetti";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "driver.js/dist/driver.css";
import TitleBar from "@/components/TitleBar";

export default function HomeLayout() {
    
    useEffect(() => {
        const jsConfetti = new JSConfetti();
    
        const tourCompleted = localStorage.getItem('tourOneCompleted') === 'true';

        if(tourCompleted){
            return
        }
    
        const driverObj = driver({
            popoverClass: 'driverjs-theme',
            allowClose: true,
            allowKeyboardControl: true,
            overlayOpacity: 0.7,
            disableActiveInteraction: true,
            prevBtnText: 'Prev',
            showButtons: ['next', 'previous', 'close'],
            nextBtnText: 'Next',
            doneBtnText: 'Finish',
            showProgress: true,
            steps: [
                { element: '#sidebarMain', popover: { title: 'Sidebar', description: 'Browse your library, downloads, and settings.', side: "bottom", align: 'center' }},
                { element: '#main', popover: { title: 'Main Content', description: 'Manage and play your music and videos.', side: "bottom", align: 'center' }},
                { element: '#player', popover: { title: 'Player', description: 'View the current track, control playback, adjust volume, select an output device, and watch videos in full screen.', side: "bottom", align: 'center' }},
                { element: '#homeButton', popover: { title: 'Home', description: 'Return to the home page.', side: "bottom", align: 'center' }},
                { element: '#downloadButton', popover: { title: 'Download', description: 'Enter a public URL, press the download button, and wait for your content to be saved.', side: "bottom", align: 'center' }},
                { element: '#youtubeButton', popover: { title: 'YouTube', description: 'Opens YouTube in a new browser window, allowing you to browse and track music.', side: "bottom", align: 'center' }},
                { element: '#settingsButton', popover: { title: 'Settings', description: 'Update the application, upgrade the yt-dlp binary, and customize the theme and colors.', side: "bottom", align: 'center' }},
                { element: '#buttonPlaylist', popover: { title: 'Create Playlist', description: 'Create a new playlist by adding a name, selecting a color, and choosing a cover image.', side: "bottom", align: 'center' }},
                { 
                    element: '#contextMenu', 
                    popover: { 
                        title: 'Context Menu', 
                        description: 'Right-click on playlists or songs to access extra options like edit, delete, or add to a playlist.', 
                        side: "bottom", 
                        align: 'center' 
                    }
                },
            ],
            
            // onDestroyStarted es llamado cuando el usuario finaliza el tour
            onDestroyStarted: () => {
                if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tutorial?")) {
                    localStorage.setItem('tourOneCompleted', "true"); // Guardar timestamp actual
                    jsConfetti.addConfetti();
                    driverObj.destroy();
                }
            },
        });
    
        driverObj.drive();
    }, []);

    return (
        <VideoFullScreenProvider>
            <div>

                <div id="app" className="relative h-screen space-x-2 pr-2">
                    <TitleBar />

                    <aside className="[grid-area:aside] flex-col flex overflow-y-auto ml-2" id="sidebarMain">
                        <AsideMenu />
                    </aside>

                    <main
                        className="[grid-area:main] rounded-lg bg-slate-200 dark:bg-zinc-900 overflow-auto h-full"
                        id="main"
                    >
                        <Suspense fallback={<div>Loading...</div>}>
                            <Outlet />
                        </Suspense>
                    </main>

                    <footer className="[grid-area:player] h-[80px] flex items-center justify-center mt-2 pr-2" id="player">
                        <Player />
                    </footer>
                </div>
                
            </div>
        </VideoFullScreenProvider>

    )
}
