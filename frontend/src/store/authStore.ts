import { create } from 'zustand';
import api from '@/lib/api';
import { User, TokenResponse, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    nickname: string;
    neighborhood?: string;
    interests?: string[];
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', { email, password });
    const data = res.data.data;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    // Fetch full user profile
    const userRes = await api.get<ApiResponse<User>>('/users/me');
    const user = userRes.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  signup: async (data) => {
    const res = await api.post<ApiResponse<TokenResponse>>('/auth/signup', data);
    const tokenData = res.data.data;
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);

    const userRes = await api.get<ApiResponse<User>>('/users/me');
    const user = userRes.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const res = await api.get<ApiResponse<User>>('/users/me');
      const user = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: async (data) => {
    const res = await api.put<ApiResponse<User>>('/users/me', data);
    const user = res.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
