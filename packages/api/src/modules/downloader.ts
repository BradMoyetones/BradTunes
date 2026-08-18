import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface DownloadConfig {
  url: string;
  extractAudio: boolean;
  videoFormat?: string; // mp4, webm, mkv
  videoQuality?: string; // best, 1080, 720, 480
  audioFormat?: string; // mp3, flac, wav, m4a
  audioQuality?: string; // 320, 256, 192, 128
  embedSubs: boolean;
  embedMetadata: boolean;
  embedThumbnail: boolean;
}

export const downloader = {
  /**
   * Ejecuta yt-dlp usando una configuración estructurada
   */
  async executeDownload(config: DownloadConfig): Promise<any> {
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
