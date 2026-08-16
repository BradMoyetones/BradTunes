import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { check, type Update } from '@tauri-apps/plugin-updater';

export type { Update };

export const app = {
    /**
     * Gets the version of the application.
     */
    getVersion,
    /**
     * Gets the version of the Tauri framework.
     */
    getTauriVersion,
    /**
     * Relaunches the application.
     */
    relaunch,
    /**
     * Checks for updates.
     */
    checkForUpdates: check,
    /**
     * Exits the application.
     */
    exit,
}