'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse, User } from '@/types';
import { fetchApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: (role: 'ESTIMATOR' | 'ADMIN') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('scopeai_token');
        const storedUser = localStorage.getItem('scopeai_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token validity with backend
          try {
            const meRes = await fetchApi<User>('/auth/me');
            if (meRes.success && meRes.data) {
              setUser(meRes.data);
              localStorage.setItem('scopeai_user', JSON.stringify(meRes.data));
            }
          } catch {
            // Token might be expired
            localStorage.removeItem('scopeai_token');
            localStorage.removeItem('scopeai_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('scopeai_token', data.token);
    localStorage.setItem('scopeai_user', JSON.stringify(data.user));
    router.push('/dashboard');
  };

  const login = async (email: string, password: string) => {
    const res = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    }
  };

  const demoLogin = async (role: 'ESTIMATOR' | 'ADMIN') => {
    const credentials =
      role === 'ADMIN'
        ? { email: 'admin@scopeai.dev', password: 'Admin123!' }
        : { email: 'estimator@scopeai.dev', password: 'Estimator123!' };

    await login(credentials.email, credentials.password);
  };


  const logout = () => {
    localStorage.removeItem('scopeai_token');
    localStorage.removeItem('scopeai_user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
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
