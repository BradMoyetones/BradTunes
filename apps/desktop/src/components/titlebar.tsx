'use client';

import { getOSInfo, OSInfo } from '@xtunes/api';
import { WindowControls } from './window-controls';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@xtunes/ui';
import { useEffect, useState } from 'react';
import { ModeToggle } from './mode-toggle';

export function Titlebar() {
    const [platform, setPlatform] = useState<OSInfo>();
    const navigate = useNavigate();

    useEffect(() => {
    const handle = async () => {
      const platform = await getOSInfo();
      setPlatform(platform!);
    };
    handle();
  }, []);
    return (
        <div data-tauri-drag-region className="flex z-1000 relative h-11 items-stretch justify-between bg-background/0 select-none overflow-hidden border-b border-border/50 pointer-events-auto!">
            {/* LEFT ZONE: Logo & macOS Margin */}
            <div data-tauri-drag-region className="flex items-center shrink-0">
                <div className={cn({
                    'ml-22': platform?.platform === 'macos',
                    'ml-4': platform?.platform !== 'macos'
                })} />
                <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-sm font-bold tracking-tight text-primary">xTunes</span>
                </div>
            </div>

            <div data-tauri-drag-region className="flex-1 min-w-0 mx-4 h-full relative">
                
            </div>

            {/* RIGHT ZONE: App Utilities & Window Controls */}
            <div data-tauri-drag-region className="flex items-stretch shrink-0">
                <ModeToggle />
                <button onClick={() => navigate("/settings")} className="px-3 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                    <Settings className="size-4" />
                </button>
                <WindowControls />
            </div>
        </div>
    );
}
