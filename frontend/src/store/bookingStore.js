import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  draft: null,

  setDraft: (draft) => set({ draft }),

  clearDraft: () => set({ draft: null }),
}));
