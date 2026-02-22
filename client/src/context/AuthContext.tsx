import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as apiLogin, ApiError } from '../api/client';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

/**
 * Decodes the JWT payload and checks whether it is expired.
 * Returns true (expired) when the token is missing, malformed, or past exp.
 * Uses a 30-second buffer so we clear tokens that are about to expire.
 */
function jwtIsExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

function loadInitialState(): { token: string | null; username: string | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USERNAME_KEY);
  if (jwtIsExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    return { token: null, username: null };
  }
  return { token, username };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ token, username }, setAuth] = useState(loadInitialState);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setAuth({ token: null, username: null });
  }, []);

  // Periodically clear state when the JWT actually expires while the tab is open
  useEffect(() => {
    if (!token) return;
    const payload = (() => {
      try { return JSON.parse(atob(token.split('.')[1])); }
      catch { return null; }
    })();
    if (!payload?.exp) return;

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }

    const id = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(id);
  }, [token, logout]);

  const login = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(code);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USERNAME_KEY, res.username);
      setAuth({ token: res.token, username: res.username });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    token,
    username,
    isAuthenticated: !!token && !!username && !jwtIsExpired(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
