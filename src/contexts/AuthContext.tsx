import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../lib/api';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'HOST';
  groupId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = ApiClient.token;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await ApiClient.get<User>('/auth/me');
        setUser(userData);
      } catch (err) {
        console.error('Failed to restore auth', err);
        ApiClient.token = null;
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    ApiClient.token = token;
    setUser(userData);
  };

  const logout = () => {
    ApiClient.token = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
