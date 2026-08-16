import { invoke } from '@tauri-apps/api/core';

import { getCurrentWindow } from '@tauri-apps/api/window';

export const window = {
    getCurrentWindow,
    minimize: () => invoke<void>('minimize_window'),
    close: () => invoke<void>('close_window'),
    toggleFullscreen: () => invoke<void>('toggle_fullscreen'),
    closeSplashscreen: () => invoke<void>('close_splashscreen'),
};