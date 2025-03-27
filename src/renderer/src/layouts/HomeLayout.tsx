import AsideMenu from "@/components/AsideMenu";
import Player from "@/components/Player";
import { VideoFullScreenProvider } from "@/contexts/VideoFullScreenContext";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function HomeLayout() {
    return (
        <VideoFullScreenProvider>
            <div>
                <div id="app" className="relative h-screen gap-2 pr-2">
                    <aside className="[grid-area:aside] flex-col flex overflow-y-auto ml-2 mt-2">
                        <AsideMenu />
                    </aside>

                    <main
                        className="[grid-area:main] rounded-lg bg-slate-200 dark:bg-zinc-900 overflow-y-auto w-full mt-2"
                    >
                        <Suspense fallback={<div>Loading...</div>}>
                            <Outlet />
                        </Suspense>
                    </main>

                    <footer className="[grid-area:player] h-[80px] flex items-center justify-center">
                        <Player />
                    </footer>
                </div>
                
            </div>
        </VideoFullScreenProvider>

    )
}
