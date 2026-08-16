import { join as tauriJoin } from '@tauri-apps/api/path';

export const path = {
  join: (...paths: string[]) => tauriJoin(...paths),
};
