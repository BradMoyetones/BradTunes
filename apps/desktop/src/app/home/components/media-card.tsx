import { VaultItem } from "@xtunes/api";
import { Card, CardFooter } from "@xtunes/ui";
import { Play, MoreVertical, Music, Video, Clock } from "lucide-react";
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { useEffect, useState } from "react";

interface MediaCardProps {
    item: VaultItem;
    onClick?: () => void;
}

export function MediaCard({ item, onClick }: MediaCardProps) {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);

    useEffect(() => {
        if (item.coverFilename) {
            appDataDir().then(dir => {
                // Obtenemos el nombre de archivo real extraído por el backend
                const coverPath = `${dir}/vault/${item.id}/${item.coverFilename}`;
                console.log(coverPath);
                
                setCoverUrl(convertFileSrc(coverPath));
            });
        }
    }, [item]);

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Card 
            className="group relative overflow-hidden p-0 gap-0 "
            onClick={onClick}
        >
            <div className="aspect-square w-full relative bg-muted/30 overflow-hidden">
                {coverUrl ? (
                    <img 
                        src={coverUrl} 
                        alt={item.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        onError={() => setCoverUrl(null)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background/50">
                        {item.hasVideo ? <Video className="w-12 h-12 text-muted-foreground/30 fill-current" /> : <Music className="w-12 h-12 text-muted-foreground/30 fill-current" />}
                    </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-xl scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 ml-1 fill-current" />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.hasVideo && (
                        <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 w-fit">
                            <Video className="w-3 h-3"/> Video
                        </div>
                    )}
                    {!item.hasVideo && item.hasAudio && (
                        <div className="px-2 py-1 rounded-md bg-pink-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 w-fit">
                            <Music className="w-3 h-3"/> Audio
                        </div>
                    )}
                </div>

                {/* Duration */}
                {item.durationSec && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1">
                        <Clock className="w-3 h-3"/> {formatDuration(item.durationSec)}
                    </div>
                )}
            </div>

            <CardFooter className="p-4 flex gap-3 items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm leading-tight truncate" title={item.title}>
                        {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1" title={item.artist || 'Unknown Artist'}>
                        {item.artist || 'Unknown Artist'}
                    </p>
                </div>
                
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-background/50 shrink-0" onClick={(e) => { e.stopPropagation(); /* TODO: Open Context Menu */ }}>
                    <MoreVertical className="w-4 h-4" />
                </button>
            </CardFooter>
        </Card>
    );
}
