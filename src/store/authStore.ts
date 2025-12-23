import { create } from 'zustand';
import { authApi } from '../services/api';
import type { LoginRequest } from '../types';

interface AuthState {
  token: string | null;
  user: {
    email: string;
    customerId: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.token) {
        const user = {
          email: response.username || '',
          customerId: response.customerId || '',
          role: response.role || 'CUSTOMER',
        };

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          token: response.token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || 'Login failed',
        });
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as Error).message || 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    } else {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
