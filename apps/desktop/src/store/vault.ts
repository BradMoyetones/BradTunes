import { create } from 'zustand';
import { api, VaultItem } from '@xtunes/api';

interface VaultStore {
    items: VaultItem[];
    isLoading: boolean;
    error: string | null;
    fetchItems: () => Promise<void>;
    startListening: () => Promise<() => void>;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const items = await api.vault.getAllItems();
            set({ items, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch vault items', isLoading: false });
        }
    },

    startListening: async () => {
        const unlisten = await api.vault.onVaultEvent((event) => {
            const currentItems = get().items;
            
            if (event.eventType === "INSERTED") {
                // Prevent duplicates
                if (!currentItems.some(i => i.id === event.item.id)) {
                    set({ items: [event.item, ...currentItems] });
                }
            } else if (event.eventType === "DELETED") {
                set({ items: currentItems.filter(i => i.id !== event.item.id) });
            } else if (event.eventType === "UPDATED") {
                // Merge real data
                set({ items: currentItems.map(i => i.id === event.item.id ? event.item : i) });
            }
        });

        return unlisten;
    }
}));
