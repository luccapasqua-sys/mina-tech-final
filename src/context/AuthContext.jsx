import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext(null);

/* Credenciais usadas apenas em MODO DEMO (sem Supabase configurado). */
const DEMO_EMAIL = 'admin@minatech.org';
const DEMO_PASSWORD = 'admin123';
const DEMO_TOKEN = 'demo-token';
const DEMO_STORAGE_KEY = 'minatech_demo_admin';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        if (data.session) {
          setUser(data.session.user);
          setToken(data.session.access_token);
        }
        setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setToken(session?.access_token ?? null);
      });

      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }

    // Modo demo: restaura sessão do localStorage
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      setUser({ email: stored, demo: true });
      setToken(DEMO_TOKEN);
    }
    setLoading(false);
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error('E-mail ou senha inválidos.');
      setUser(data.user);
      setToken(data.session.access_token);
      return;
    }

    // Modo demo
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(DEMO_STORAGE_KEY, DEMO_EMAIL);
      setUser({ email: DEMO_EMAIL, demo: true });
      setToken(DEMO_TOKEN);
      return;
    }
    throw new Error('E-mail ou senha inválidos.');
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    isDemo: !isSupabaseConfigured,
    demoCredentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
