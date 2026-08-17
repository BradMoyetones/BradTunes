import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface ConsoleLogEvent {
  source: 'stdout' | 'stderr';
  line: string;
}

export const consoleStream = {
  /**
   * Ejecuta un comando en la consola integrado, limitando los argumentos al binario yt-dlp
   * Automáticamente se inyecta la ruta de ffmpeg.
   */
  async executeConsoleCommand(args: string[]): Promise<void> {
    return invoke('execute_console_command', { args });
  },

  /**
   * Se suscribe al stream de la terminal asíncrona para @xterm/xterm
   */
  async onConsoleLog(callback: (event: ConsoleLogEvent) => void): Promise<UnlistenFn> {
    return listen<ConsoleLogEvent>('console-log', (event) => {
      callback(event.payload);
    });
  }
};
