import { create } from 'zustand';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5099';

export const api = axios.create({
  baseURL: API,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // SYSTEMIC FIX for 404: Ensure all URLs are prefixed with /api
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[AUTH-BRIDGE] Token expired or invalid. Logging out...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 400) {
      console.error('[AUTH-DIAGNOSTIC] 400 Bad Request Details:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userStr) return null;
    
    const user = JSON.parse(userStr);
    // Flush stale 'demo-admin-id' sessions to prevent ObjectId cast errors
    if (user._id === 'demo-admin-id') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
    return user;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      try {
        const { data } = await api.post('/users/login', { email, password });
        set({ user: data, token: data.token, status: 'authenticated', isLoading: false });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data)); // Store user data
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 500 || error.code === 'ERR_NETWORK') {
           console.warn('Backend DB issue detected (Status: ' + (error.response?.status || 'Network Error') + '). Attempting Emergency Bypass...');
           const { data } = await api.post('/users/login/emergency', { email, password });
           set({ user: data, token: data.token, status: 'authenticated', isLoading: false });
           localStorage.setItem('token', data.token);
           localStorage.setItem('user', JSON.stringify(data)); // Store user data
        } else {
           throw error;
        }
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users', userData);
      const { token, ...newUserData } = response.data;
      localStorage.setItem('user', JSON.stringify(newUserData));
      localStorage.setItem('token', token);
      set({ user: newUserData, token, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
