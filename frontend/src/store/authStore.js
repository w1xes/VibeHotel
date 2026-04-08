import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  setSession: async (session) => {
    if (!session) {
      set({ user: null, session: null, loading: false });
      return;
    }
    try {
      const profile = await api.get('/users/me');
      set({ user: profile, session, loading: false });
    } catch {
      set({ user: null, session, loading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

// Listen to auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
