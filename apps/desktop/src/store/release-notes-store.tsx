import { create } from 'zustand';

interface ReleaseNotesState {
    pendingNotes: string | null;
    setPendingNotes: (notes: string | null) => void;
}

export const useReleaseNotesStore = create<ReleaseNotesState>((set) => ({
    pendingNotes: null,
    setPendingNotes: (notes) => set({ pendingNotes: notes }),
}));
