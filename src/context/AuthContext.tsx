import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setAccessToken } from '../services/api';
import { mockEngine } from '../services/mockEngine';

interface AuthContextType {
  user: User | null;
  token: string | null;
  deviceId: string;
  isLoading: boolean;
  setupRequired: boolean;
  login: (u: string, p: string, totpCode?: string) => Promise<{ requires_2fa?: boolean }>;
  loginWithGoogle: (credential: string) => Promise<void>;
  setupAdmin: (u: string, p: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: 'admin' | 'read_only') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(mockEngine.getCurrentUser());
  const [token, setToken] = useState<string | null>('demo-admin-token');
  const [deviceId] = useState<string>(api.getDeviceId());
  const [isLoading, setIsLoading] = useState(false);
  const [setupRequired] = useState(false);

  const refreshUser = useCallback(async () => {
    if (mockEngine.isLoggedIn()) {
      setUser(mockEngine.getCurrentUser());
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUser(mockEngine.getCurrentUser());
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string, _totpCode?: string) => {
    const res = await api.login(u, p);
    if (res.access_token) {
      setAccessToken(res.access_token);
      setToken(res.access_token);
      setUser(mockEngine.getCurrentUser());
    }
    return { requires_2fa: false };
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await api.loginWithGoogle(credential);
    setAccessToken(res.access_token);
    setToken(res.access_token);
    setUser(mockEngine.getCurrentUser());
  };

  const setupAdmin = async (u: string, p: string) => {
    const res = await api.setupAdmin(u, p);
    setAccessToken(res.access_token);
    setToken(res.access_token);
    setUser(mockEngine.getCurrentUser());
  };

  const logout = async () => {
    await api.logout();
    setAccessToken(null);
    setToken(null);
    setUser(null);
  };

  const setRole = (role: 'admin' | 'read_only') => {
    mockEngine.setRole(role);
    setUser(mockEngine.getCurrentUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        deviceId,
        isLoading,
        setupRequired,
        login,
        loginWithGoogle,
        setupAdmin,
        refreshUser,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
