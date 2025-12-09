import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, logout as apiLogout, getMe, getToken } from '../services/auth';

type AuthContextType = {
  email: string | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [savedToken, savedEmail] = await Promise.all([
        getToken(),
        AsyncStorage.getItem('evdam:user'),
      ]);
      if (savedToken) setToken(savedToken);
      if (savedEmail) setEmail(savedEmail);
      // (opcional) valida token contra /me
      if (savedToken) {
        const me = await getMe().catch(() => null);
        if (!me) { await apiLogout(); setToken(null); setEmail(null); }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (userEmail: string, password: string) => {
    const t = await apiLogin(userEmail, password);
    setToken(t);
    setEmail(userEmail);
  };

  const signOut = async () => {
    await apiLogout();
    setToken(null);
    setEmail(null);
  };

  const value = useMemo(() => ({
    email, token, loading, signIn, signOut, isAuthenticated: !!token,
  }), [email, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
