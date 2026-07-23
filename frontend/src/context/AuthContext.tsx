import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, FILE_BASE_URL } from '../config/api';

export { API_BASE_URL, FILE_BASE_URL };

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'CITIZEN' | 'EMPLOYEE' | 'ADMIN';
  isVerified: boolean;
  employeeId?: string; // E.g., EMP-2026-0001
  employeeUuid?: string; // Employee table ID
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (data: any) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
  updateUser: (newUser: User) => Promise<void>;
  bypassLogin: (role: 'ADMIN' | 'CITIZEN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load auth credentials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      if (data.token && typeof data.token === 'string') {
        await SecureStore.setItemAsync('token', data.token);
      } else {
        console.warn('Auth token was missing or not a string.');
      }

      if (data.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      } else {
        console.warn('Auth user data was missing.');
      }

      setToken(data.token || null);
      setUser(data.user || null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (regData: any): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      setError(err.message || 'Network error.');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to request reset.');
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const resetPassword = async (resetData: any): Promise<{ success: boolean; message: string }> => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset password failed.');
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const updateUser = async (newUser: User) => {
    try {
      if (newUser) {
        await SecureStore.setItemAsync('user', JSON.stringify(newUser));
        setUser(newUser);
      }
    } catch (err) {
      console.error('Failed to update user in secure store:', err);
    }
  };

  const bypassLogin = async (role: 'ADMIN' | 'CITIZEN') => {
    setIsLoading(true);
    try {
      const mockUser: User = role === 'ADMIN' ? {
        id: 'mock-admin-id',
        username: 'admin',
        email: 'admin@panchayat.gov.in',
        fullName: 'Gram Panchayat Admin (Bypass)',
        phone: '9999999999',
        role: 'ADMIN',
        isVerified: true
      } : {
        id: 'mock-citizen-id',
        username: 'citizen_test',
        email: 'citizen@example.com',
        fullName: 'Ramesh Kumar (Bypass)',
        phone: '8888888888',
        role: 'CITIZEN',
        isVerified: true
      };

      const mockToken = 'mock-jwt-token-for-testing';

      await SecureStore.setItemAsync('token', mockToken);
      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
    } catch (err) {
      console.error('Bypass login storage error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearError,
        updateUser,
        bypassLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
