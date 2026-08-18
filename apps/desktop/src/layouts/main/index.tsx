import { useLocation, useOutlet, Link } from 'react-router';
import { Titlebar } from '@/components/titlebar';
import { useUpdater } from '@/hooks/use-updater';
import { useEffect } from 'react';
import { api } from '@xtunes/api';
import { AnimatePresence, motion } from 'motion/react';
import { Button, pageTransition } from '@xtunes/ui';
import { Download, House, Settings } from 'lucide-react';

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
    const location = useLocation();
    const outlet = useOutlet();

    return (
        <div className="bg-background h-screen flex flex-col font-sans antialiased text-foreground selection:bg-primary/30 overflow-hidden">
            <UpdaterComponent />
            
            {/* Titlebar Aislada */}
            <div className="flex-none w-full z-50">
                <Titlebar />
            </div>

            {/* Contenedor de Islas (El Océano) */}
            <div className="flex-1 flex flex-col p-3 pt-0 gap-3 overflow-hidden">
                
                {/* Fila Superior: Sidebar + Main */}
                <div className="flex-1 flex gap-3 overflow-hidden">
                    
                    {/* Isla: Sidebar */}
                    <aside className="w-64 flex-none rounded-2xl border border-border/50 bg-card/60 shadow-sm flex flex-col p-4">
                        <header className="flex flex-col gap-2">
                            <Link to="/" className="w-full">
                                <Button variant="ghost" size={"lg"} className="w-full justify-start">
                                    <House className="mr-2" />
                                    Home
                                </Button>
                            </Link>
                            <Link to="/download" className="w-full">
                                <Button variant="ghost" size={"lg"} className="w-full justify-start">
                                    <Download className="mr-2" />
                                    Download
                                </Button>
                            </Link>
                            <Link to="/settings" className="w-full">
                                <Button variant="ghost" size={"lg"} className="w-full justify-start">
                                    <Settings className="mr-2" />
                                    Settings
                                </Button>
                            </Link>
                        </header>
                        <nav className="flex-1 space-y-2 h-full">

                        </nav>
                    </aside>

                    {/* Isla: Main Content */}
                    <main className="flex-1 rounded-2xl border border-border/50 bg-card/60 shadow-sm overflow-y-auto relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                className="w-full min-h-full p-6"
                                {...pageTransition}
                            >
                                {outlet}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* Fila Inferior: Player */}
                <div className="flex-none h-24">
                    <footer className="w-full h-full rounded-2xl border border-border/50 bg-card/60 shadow-sm flex items-center px-6">
                        {/* Controles de reproducción */}
                    </footer>
                </div>
                
            </div>
        </div>
    );
}
