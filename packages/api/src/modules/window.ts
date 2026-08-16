import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const window = {
    /**
     * Gets the current window.
     */
    getCurrentWindow,
    /**
     * Minimizes the window.
     */
    minimize: () => invoke<void>('minimize_window'),
    /**
     * Closes the window.
     */
    close: () => invoke<void>('close_window'),
    /**
     * Toggles the fullscreen mode of the window.
     */
    toggleFullscreen: () => invoke<void>('toggle_fullscreen'),
    /**
     * Closes the splashscreen.
     */
    closeSplashscreen: () => invoke<void>('close_splashscreen'),
};