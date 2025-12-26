import { create } from 'zustand';
import type { User, LoginDto, RegisterDto, AuthResponse } from '@repo/types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (loginDto) => {
    const res = await api.post<AuthResponse>('/agent/login', loginDto);
    const { token, agent } = res.data;
    
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(agent));
    set({ user: agent, isAuthenticated: true });
  },

  register: async (registerDto) => {
    await api.post('/agent/register', registerDto);
  },

  updateProfile: async (data) => {
    const res = await api.put<{ success: boolean; agent: User }>('/agent/profile', data);
    if (res.data.success) {
      set({ user: res.data.agent });
      localStorage.setItem('user', JSON.stringify(res.data.agent));
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }
      
      // Load user from local storage first for immediate UI
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isAuthenticated: true });
      }

      const res = await api.get('/agent/me');
      set({ user: res.data, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (e) {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }
}));
