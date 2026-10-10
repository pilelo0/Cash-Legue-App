import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import type { Usuario } from './types';

interface AppContextValue {
  currentUser: Usuario | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  allUsers: Usuario[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const DEMO_USERNAMES = ['ProGamer_CL', 'ShadowKnight', 'NeoFighter', 'GoldenAce', 'PixelWarrior'];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<Usuario[]>([]);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from('usuarios').select('*').order('username');
    if (data) setAllUsers(data as Usuario[]);
    return data as Usuario[];
  }, []);

  const refreshUser = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (data) setCurrentUser(data as Usuario);
  }, [currentUser]);

  const ensureDemoUsers = useCallback(async () => {
    const existing = await loadUsers();
    if (existing.length > 0) return existing;

    const created: Usuario[] = [];
    for (const username of DEMO_USERNAMES) {
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          username,
          balance_clp: 142000,
          balance_usd: 142,
        })
        .select('*')
        .single();
      if (!error && data) created.push(data as Usuario);
    }
    setAllUsers(created);
    return created;
  }, [loadUsers]);

  const loginAsDemo = useCallback(async () => {
    setLoading(true);
    const users = await ensureDemoUsers();
    const stored = localStorage.getItem('cash_league_user_id');
    let user: Usuario | undefined;
    if (stored) {
      user = users.find((u) => u.id === stored);
    }
    if (!user) {
      user = users[0];
      localStorage.setItem('cash_league_user_id', user.id);
    }
    setCurrentUser(user);
    setLoading(false);
  }, [ensureDemoUsers]);

  const switchUser = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) {
        setCurrentUser(data as Usuario);
        localStorage.setItem('cash_league_user_id', data.id);
      }
    },
    []
  );

  useEffect(() => {
    loginAsDemo();
  }, [loginAsDemo]);

  return (
    <AppContext.Provider
      value={{ currentUser, loading, refreshUser, loginAsDemo, switchUser, allUsers }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
