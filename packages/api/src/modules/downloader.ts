import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface DownloadConfig {
  url: string;
  format: string;
  extractAudio: boolean;
  audioFormat?: string;
  embedSubs: boolean;
}

export const downloader = {
  /**
   * Ejecuta yt-dlp usando una configuración estructurada
   */
  async executeDownload(config: DownloadConfig): Promise<void> {
    return invoke('execute_download', { config });
  },

  /**
   * Se suscribe al evento cuando la descarga finaliza (el proceso yt-dlp termina)
   */
  async onDownloadFinished(callback: () => void): Promise<UnlistenFn> {
    return listen('download-finished', () => {
      callback();
    });
  }
};
