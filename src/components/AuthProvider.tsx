'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/lib/types';
import Cookies from 'js-cookie';

interface AuthContextValue {
  user: User | null;
  csrfToken: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  csrfToken: null,
  isLoading: false,
  logout: async () => {},
  role: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  // Lazy-initialise from cookie; no effect needed since cookies are synchronously readable
  const [csrfToken, setCsrfToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return Cookies.get('csrf_token') ?? null;
  });

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken ?? '',
          'Content-Type': 'application/json',
        },
      });
    } finally {
      setUser(null);
      setCsrfToken(null);
      window.location.href = '/login';
    }
  }, [csrfToken]);

  return (
    <AuthContext.Provider
      value={{ user, csrfToken, isLoading: false, logout, role: user?.role ?? null }}
    >
      {children}
    </AuthContext.Provider>
  );
}
