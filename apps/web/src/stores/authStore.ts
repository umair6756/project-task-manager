import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  timezone: string;
  weekStartDay: number;
  dayEndHour: number;
  avatarUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

const REFRESH_KEY = "flowforge.refreshToken";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: localStorage.getItem(REFRESH_KEY),
  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ user, accessToken, refreshToken });
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => {
    localStorage.removeItem(REFRESH_KEY);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
