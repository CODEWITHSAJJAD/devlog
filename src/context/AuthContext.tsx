import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SafeUser } from '../../shared/types';
import { apiFetch } from '../utils/api';

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (user: SafeUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiFetch<SafeUser>('/api/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = (userData: SafeUser) => setUser(userData);

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
