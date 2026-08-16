import { Outlet } from 'react-router';
import { Titlebar } from '@/components/titlebar';
import { useUpdater } from '@/hooks/use-updater';
import { useEffect } from 'react';
import { api } from '@xtunes/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@xtunes/ui';

function UpdaterComponent() {
    const { checkForUpdates, promptUpdate } = useUpdater();

    useEffect(() => {
        // Ejecutar revisión de actualizaciones antes de cerrar el splash
        checkForUpdates()
            .then((update) => {
                if (update) promptUpdate(update);
            })
            .finally(() => {
                api.window.closeSplashscreen().catch(console.error);
            });
    }, []);

    return null;
}

export default function MainLayout() {
    return (
        <div className="bg-background/80 min-h-screen flex flex-col">
            <UpdaterComponent />
            <div className="app-layout bg-transparent font-sans antialiased text-foreground selection:bg-primary/30 flex-1">
                <div className="[grid-area:title]">
                    <Titlebar />
                </div>

                <aside className="[grid-area:aside] bg-sidebar/30 flex flex-col border-2 border-muted p-4 rounded-2xl m-2">
                    <nav className="flex-1 space-y-2 h-full">{/* Elementos de navegación aquí */}</nav>
                </aside>

                <main className="[grid-area:main] rounded-2xl border-2 border-muted m-2 mr-2 overflow-y-auto bg-background/30 p-4">
                    <Outlet />
                </main>

                {/* Reproductor inferior: Efecto cristal fuerte */}
                <footer className="[grid-area:player] rounded-2xl m-2 h-24  shrink-0 bg-background/30 border-2 border-muted flex items-center px-6 z-40">
                    {/* Controles de reproducción */}
                </footer>
            </div>
        </div>
    );
}
