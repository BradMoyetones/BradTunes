'use client';

import { api, getOSInfo, OSInfo } from '@xtunes/api';
import { useInterval } from '@mantine/hooks';
import { cn } from '@xtunes/ui';
import { ButtonHTMLAttributes, useEffect, useState } from 'react';
import { VscChromeMaximize, VscChromeMinimize, VscChromeClose, VscChromeRestore } from 'react-icons/vsc';

const ButtonWindowControl = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            // Retain the exact native feel (aspect square, 11 height from parent)
            className={cn(
                'hover:bg-muted aspect-square h-full text-muted-foreground flex items-center justify-center transition-colors',
                props.className
            )}
        />
    );
};

interface WindowControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function WindowControls({className, ...props}: WindowControlsProps) {
    const [platform, setPlatform] = useState<OSInfo>();
    const [maximized, setMaximized] = useState(false);

    const tauriInterval = useInterval(async () => {
        try {
            const window = api.window.getCurrentWindow();
            const isMaximized = await window.isMaximized();
            setMaximized(isMaximized);
        } catch (e) {
            // Ignore if running outside Tauri
        }
    }, 200);

    useEffect(() => {
        tauriInterval.start();
        return () => tauriInterval.stop();
    }, [tauriInterval]);

    useEffect(() => {
        const handle = async () => {
            const platform = await getOSInfo();
            setPlatform(platform!);
        };
        handle();
    }, []);

    // Native window controls are only manually rendered on non-macOS platforms.
    // macOS uses its native traffic lights.
    if (platform?.platform === 'macos') return null;

    return (
        <div className={cn("flex h-full items-stretch", className)} {...props}>
            <ButtonWindowControl
                onClick={() => {
                    api.window.getCurrentWindow().minimize().catch(console.error);
                }}
            >
                <VscChromeMinimize className="size-4" />
            </ButtonWindowControl>
            <ButtonWindowControl
                onClick={() => {
                    api.window.getCurrentWindow().toggleMaximize().catch(console.error);
                    setMaximized(!maximized);
                }}
            >
                {maximized ? <VscChromeRestore className="size-4" /> : <VscChromeMaximize className="size-4" />}
            </ButtonWindowControl>
            <ButtonWindowControl
                onClick={() => {
                    api.window.getCurrentWindow().close().catch(console.error);
                }}
                className="hover:bg-red-500 hover:text-red-50"
            >
                <VscChromeClose className="size-4" />
            </ButtonWindowControl>
        </div>
    );
}
