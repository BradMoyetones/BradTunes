import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { check, type Update } from '@tauri-apps/plugin-updater';

export type { Update };

export const app = {
    getVersion,
    getTauriVersion,
    relaunch,
    checkForUpdates: check,
    exit,
}