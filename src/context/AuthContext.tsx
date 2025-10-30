import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  email: string | null;
  isAuthenticated: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const signIn = (userEmail: string) => {
    setEmail(userEmail);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setEmail(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // console.log('Auth changed:', { email, isAuthenticated });
  }, [email, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ email, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
