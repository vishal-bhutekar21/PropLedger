import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('pl_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pl_token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ usernameOrEmail, password });
      localStorage.setItem('pl_token', data.token);
      localStorage.setItem('pl_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: string) => user?.roles?.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
