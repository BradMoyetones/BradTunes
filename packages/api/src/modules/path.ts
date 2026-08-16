import { join as tauriJoin, normalize as tauriNormalize, resolve as tauriResolve } from '@tauri-apps/api/path';

export const path = {
  /**
   * Joins path segments.
   */
  join: (...paths: string[]) => tauriJoin(...paths),
  /**
   * Normalizes a path.
   */
  normalize: (path: string) => tauriNormalize(path),
  /**
   * Resolves a path.
   */
  resolve: (...paths: string[]) => tauriResolve(...paths),
};
