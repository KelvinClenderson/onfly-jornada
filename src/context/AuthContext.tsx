import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GoogleUser } from '@/types/google-calendar';

interface OnflyUser {
  id: string;
  name: string;
  email: string;
  company: string | null;
  avatar: string | null;
  role: string | null;
}

interface AuthSession {
  user: OnflyUser;
  onfly_jwt: string;
  expires_at: number;
}

interface GoogleSession {
  access_token: string;
  refresh_token: string | null;
  user: GoogleUser;
}

interface AuthContextType {
  // Onfly session (legacy)
  user: OnflyUser | null;
  onflyJwt: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOnfly: () => Promise<void>;
  handleOAuthCallback: (code: string, state: string | null, expectedState: string | null) => Promise<boolean>;

  // Google session
  googleUser: GoogleUser | null;
  googleCalendarToken: string | null;
  saveGoogleSession: (accessToken: string, refreshToken: string | null, user: GoogleUser) => void;

  // Shared
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ONFLY_SESSION_KEY = 'onfly_session';
const GOOGLE_SESSION_KEY = 'google_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OnflyUser | null>(null);
  const [onflyJwt, setOnflyJwt] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleCalendarToken, setGoogleCalendarToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore sessions on mount
  useEffect(() => {
    try {
      const storedOnfly = sessionStorage.getItem(ONFLY_SESSION_KEY);
      if (storedOnfly) {
        const session: AuthSession = JSON.parse(storedOnfly);
        if (session.expires_at > Date.now()) {
          setUser(session.user);
          setOnflyJwt(session.onfly_jwt);
        } else {
          sessionStorage.removeItem(ONFLY_SESSION_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(ONFLY_SESSION_KEY);
    }

    try {
      const storedGoogle = sessionStorage.getItem(GOOGLE_SESSION_KEY);
      if (storedGoogle) {
        const session: GoogleSession = JSON.parse(storedGoogle);
        setGoogleCalendarToken(session.access_token);
        setGoogleUser(session.user);
      }
    } catch {
      sessionStorage.removeItem(GOOGLE_SESSION_KEY);
    }

    setIsLoading(false);
  }, []);

  const saveGoogleSession = useCallback(
    (accessToken: string, refreshToken: string | null, user: GoogleUser) => {
      setGoogleCalendarToken(accessToken);
      setGoogleUser(user);
      sessionStorage.setItem(
        GOOGLE_SESSION_KEY,
        JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, user }),
      );
    },
    [],
  );

  // ── Onfly mock login (kept for backward compatibility) ────────────────────
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('onfly-auth/mock-login', {
        body: { email, password },
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || 'Erro ao autenticar' };
      }
      const session: AuthSession = {
        user: data.user,
        onfly_jwt: data.onfly_jwt,
        expires_at: Date.now() + data.expires_in * 1000,
      };
      setUser(session.user);
      setOnflyJwt(session.onfly_jwt);
      sessionStorage.setItem(ONFLY_SESSION_KEY, JSON.stringify(session));
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }, []);

  const loginWithOnfly = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('onfly-auth/authorize');
      if (error || !data?.authorize_url) throw new Error('Falha ao iniciar OAuth');
      sessionStorage.setItem('onfly_oauth_state', data.state);
      window.location.href = data.authorize_url;
    } catch (err) {
      console.error('OAuth init failed:', err);
    }
  }, []);

  const handleOAuthCallback = useCallback(
    async (code: string, state: string | null, expectedState: string | null): Promise<boolean> => {
      try {
        const { data, error } = await supabase.functions.invoke('onfly-auth/callback', {
          body: { code, state, expected_state: expectedState },
        });
        if (error || data?.error) return false;
        const session: AuthSession = {
          user: data.user,
          onfly_jwt: data.onfly_jwt,
          expires_at: Date.now() + data.expires_in * 1000,
        };
        setUser(session.user);
        setOnflyJwt(session.onfly_jwt);
        sessionStorage.setItem(ONFLY_SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem('onfly_oauth_state');
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setOnflyJwt(null);
    setGoogleUser(null);
    setGoogleCalendarToken(null);
    sessionStorage.removeItem(ONFLY_SESSION_KEY);
    sessionStorage.removeItem(GOOGLE_SESSION_KEY);
    sessionStorage.removeItem('onfly_oauth_state');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        onflyJwt,
        login,
        loginWithOnfly,
        handleOAuthCallback,
        googleUser,
        googleCalendarToken,
        saveGoogleSession,
        isAuthenticated: !!(user || googleUser),
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
