import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export type BinaryState = 
  | { status: 'READY'; version: string }
  | { status: 'MISSING' }
  | { status: 'UPDATE_AVAILABLE'; currentVersion: string; latestVersion: string };

export interface DependenciesStatus {
  yt_dlp: BinaryState;
  ffmpeg: BinaryState;
}

export interface DownloadProgressPayload {
  binary: 'yt-dlp' | 'ffmpeg';
  downloadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export const binaries = {
  /**
   * Verifica la existencia y versión de yt-dlp y ffmpeg
   */
  async checkDependencies(): Promise<DependenciesStatus> {
    return invoke<DependenciesStatus>('check_dependencies');
  },

  /**
   * Instala o actualiza el binario especificado
   */
  async installBinary(binary: 'yt-dlp' | 'ffmpeg'): Promise<void> {
    return invoke('install_binary', { binary });
  },

  /**
   * Se suscribe a los eventos de progreso de descarga del binario.
   */
  async onDownloadProgress(callback: (payload: DownloadProgressPayload) => void): Promise<UnlistenFn> {
    return listen<DownloadProgressPayload>('binary-download-progress', (event) => {
      callback(event.payload);
    });
  }
};
