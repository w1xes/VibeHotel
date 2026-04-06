import { create } from 'zustand';

const stored = JSON.parse(localStorage.getItem('vibehotel-auth') || 'null');

export const useAuthStore = create((set) => ({
  user: stored?.user || null,
  token: stored?.token || null,

  login: (user, token) => {
    const payload = { user, token };
    localStorage.setItem('vibehotel-auth', JSON.stringify(payload));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('vibehotel-auth');
    set({ user: null, token: null });
  },

  updateProfile: (updates) =>
    set((state) => {
      const user = { ...state.user, ...updates };
      const payload = { user, token: state.token };
      localStorage.setItem('vibehotel-auth', JSON.stringify(payload));
      return { user };
    }),
}));
