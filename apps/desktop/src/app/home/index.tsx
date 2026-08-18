import { useEffect } from "react";
import { MediaCard } from "./components/media-card";
import { Library, FolderOpen } from "lucide-react";

import { useVaultStore } from "../../store/vault";

export default function Home() {
    const { items: data, fetchItems, startListening } = useVaultStore();

    useEffect(() => {
        fetchItems();
        
        let cleanup: (() => void) | undefined;
        startListening().then(unlisten => {
            cleanup = unlisten;
        }).catch(console.error);

        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex-none">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Library className="w-8 h-8 text-primary" />
                    My Vault
                </h1>
                <p className="text-muted-foreground mt-1">Your locally downloaded library of music and videos.</p>
            </header>

            <div className="flex-1 min-h-0 pr-2 pb-6">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <FolderOpen className="w-16 h-16 text-muted-foreground" />
                        <div>
                            <h2 className="text-xl font-semibold">Vault is Empty</h2>
                            <p className="text-muted-foreground">Go to Downloads to add some media.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                        {data.map(item => (
                            <MediaCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
