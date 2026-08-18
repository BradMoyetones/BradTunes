import { api, VaultItem } from "@xtunes/api";
import { useEffect, useState } from "react";
import { MediaCard } from "./components/media-card";
import { Library, FolderOpen } from "lucide-react";

export default function Home() {
    const [data, setData] = useState<VaultItem[]>([]);

    useEffect(() => {
        api.vault.getAllItems().then((res) => setData(res)).catch(console.error);
        
        // Listen to vault updates dynamically
        const unlisten = api.vault.onVaultEvent((event) => {
            if (event.eventType === "INSERTED") {
                setData(prev => [event.item, ...prev]);
            } else if (event.eventType === "DELETED") {
                setData(prev => prev.filter(i => i.id !== event.item.id));
            } else if (event.eventType === "UPDATED") {
                setData(prev => prev.map(i => i.id === event.item.id ? event.item : i));
            }
        });

        return () => {
            unlisten.then(fn => fn());
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {data.map(item => (
                            <MediaCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
