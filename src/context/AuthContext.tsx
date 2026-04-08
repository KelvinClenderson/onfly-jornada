import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface AuthContextType {
  user: OnflyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onflyJwt: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOnfly: () => Promise<void>;
  handleOAuthCallback: (code: string, state: string | null, expectedState: string | null) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'onfly_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OnflyUser | null>(null);
  const [onflyJwt, setOnflyJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        if (session.expires_at > Date.now()) {
          setUser(session.user);
          setOnflyJwt(session.onfly_jwt);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const saveSession = (session: AuthSession) => {
    setUser(session.user);
    setOnflyJwt(session.onfly_jwt);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  // Mock login fallback for hackathon
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('onfly-auth/mock-login', {
        body: { email, password },
      });

      if (error || data?.error) {
        return { success: false, error: data?.error || 'Erro ao autenticar' };
      }

      saveSession({
        user: data.user,
        onfly_jwt: data.onfly_jwt,
        expires_at: Date.now() + (data.expires_in * 1000),
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }, []);

  // Real Onfly OAuth flow
  const loginWithOnfly = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('onfly-auth/authorize');

      if (error || !data?.authorize_url) {
        throw new Error('Falha ao iniciar OAuth');
      }

      // Save state for CSRF validation
      sessionStorage.setItem('onfly_oauth_state', data.state);

      // Redirect user to Onfly consent page
      window.location.href = data.authorize_url;
    } catch (err) {
      console.error('OAuth init failed:', err);
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (
    code: string,
    state: string | null,
    expectedState: string | null
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('onfly-auth/callback', {
        body: { code, state, expected_state: expectedState },
      });

      if (error || data?.error) {
        console.error('OAuth callback failed:', data?.error || error);
        return false;
      }

      saveSession({
        user: data.user,
        onfly_jwt: data.onfly_jwt,
        expires_at: Date.now() + (data.expires_in * 1000),
      });

      sessionStorage.removeItem('onfly_oauth_state');
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOnflyJwt(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('onfly_oauth_state');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      onflyJwt,
      login,
      loginWithOnfly,
      handleOAuthCallback,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
