import AsideMenu from "@/components/AsideMenu";
import Player from "@/components/Player";
import { VideoFullScreenProvider } from "@/contexts/VideoFullScreenContext";
import { driver } from "driver.js";
import JSConfetti from "js-confetti";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "driver.js/dist/driver.css";

export default function HomeLayout() {

    localStorage.setItem('tourCompletedLunches', ""); // Guardar timestamp actual
    
    useEffect(() => {
        const jsConfetti = new JSConfetti();
    
        // Verificar si el tour ya fue completado y la fecha
        const tourTimestamp = localStorage.getItem('tourCompletedLunches');
        const now = Date.now(); // Marca de tiempo actual en milisegundos
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    
        if (tourTimestamp && now - parseInt(tourTimestamp, 10) < sevenDaysInMs) {
            // Si han pasado menos de 7 días, no iniciar el tour
            return;
        }
    
        const driverObj = driver({
            popoverClass: 'driverjs-theme',
            allowClose: false,
            disableActiveInteraction: true,
            prevBtnText: 'Prev',
            showButtons: ['next', 'previous'],
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
            ],
            
            // onDestroyStarted es llamado cuando el usuario finaliza el tour
            onDestroyStarted: () => {
                if (!driverObj.hasNextStep() || confirm("¿Estás seguro?")) {
                    localStorage.setItem('tourCompletedLunches', now.toString()); // Guardar timestamp actual
                    jsConfetti.addConfetti();
                    // jsConfetti.addConfetti({
                    //     emojis: ['🏳️‍🌈'],
                    // });
                    driverObj.destroy();
                }
            },
        });
    
        driverObj.drive();
    }, []);
    return (
        <VideoFullScreenProvider>
            <div>
                <div id="app" className="relative h-screen gap-2 pr-2">
                    <aside className="[grid-area:aside] flex-col flex overflow-y-auto ml-2 mt-2" id="sidebarMain">
                        <AsideMenu />
                    </aside>

                    <main
                        className="[grid-area:main] rounded-lg bg-slate-200 dark:bg-zinc-900 overflow-y-auto w-full mt-2"
                        id="main"
                    >
                        <Suspense fallback={<div>Loading...</div>}>
                            <Outlet />
                        </Suspense>
                    </main>

                    <footer className="[grid-area:player] h-[80px] flex items-center justify-center" id="player">
                        <Player />
                    </footer>
                </div>
                
            </div>
        </VideoFullScreenProvider>

    )
}
