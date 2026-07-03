import { create } from 'zustand';
import type { UserSession } from '../types';
import { authApi } from '../api';

interface UserState {
  user: UserSession | null;
  token: string;
  setUser: (user: UserSession | null) => void;
  logout: () => void;
  hasRole: (roleCode: string) => boolean;
  isAdmin: () => boolean;
}

const loadUser = (): UserSession | null => {
  try {
    const str = localStorage.getItem('username');
    if (str) return JSON.parse(str);
  } catch (e) {
    // ignore
  }
  return null;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: loadUser(),
  token: loadUser()?.token || '',

  setUser: (user) => {
    if (user) {
      localStorage.setItem('username', JSON.stringify(user));
      set({ user, token: user.token });
    } else {
      localStorage.removeItem('username');
      set({ user: null, token: '' });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore logout error
    }
    localStorage.removeItem('username');
    set({ user: null, token: '' });
  },

  hasRole: (roleCode: string) => {
    const user = get().user;
    if (!user) return false;
    return user.role.some((r) => r.code === roleCode);
  },

  isAdmin: () => get().hasRole('admin'),
}));
