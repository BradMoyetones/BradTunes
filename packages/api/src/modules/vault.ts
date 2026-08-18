import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface VaultItem {
  id: string;
  title: string;
  artist?: string;
  durationSec?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  hasCover: boolean;
}

export interface VaultEvent {
  eventType: 'INSERTED' | 'UPDATED' | 'DELETED';
  item: VaultItem;
}

export const vault = {
  /**
   * Obtiene todos los elementos del Vault desde la base de datos SQLite.
   * Útil para la carga inicial súper rápida.
   */
  async getAllItems(): Promise<VaultItem[]> {
    return invoke<VaultItem[]>('get_all_items');
  },

  /**
   * Obtiene un solo elemento del Vault por su ID.
   */
  async getItem(id: string): Promise<VaultItem | null> {
    return invoke<VaultItem | null>('get_item', { id });
  },

  /**
   * Elimina un elemento del Vault.
   */
  async deleteItem(id: string): Promise<void> {
    return invoke('delete_item', { id });
  },

  /**
   * Actualiza los metadatos modificables de un elemento en el Vault.
   */
  async updateItemMetadata(id: string, title: string, artist?: string): Promise<void> {
    return invoke('update_item_metadata', { id, title, artist });
  },

  /**
   * Se suscribe a los eventos Hyper Real-Time del File System Watcher.
   */
  async onVaultEvent(callback: (event: VaultEvent) => void): Promise<UnlistenFn> {
    return listen<VaultEvent>('vault-event', (event) => {
      callback(event.payload);
    });
  }
};
