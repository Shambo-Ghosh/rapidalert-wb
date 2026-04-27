import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'guest' | 'staff' | 'responder' | 'admin' | null;

interface UserState {
  user: any | null;
  role: UserRole;
  setAuth: (user: any, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      setAuth: (user, role) => set({ user, role }),
      logout: () => set({ user: null, role: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface AppState {
  language: 'en' | 'bn';
  toggleLanguage: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'bn' : 'en' })),
    }),
    {
      name: 'app-storage',
    }
  )
);
