'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { refreshClient } from '@/lib/api/refreshClient';
import { tokenStore } from './tokenStore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  fleetId?: string;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!tokenStore.get()) {
          const { data: refresh } = await refreshClient.post('/auth/refresh');
          tokenStore.set(refresh.data.accessToken);
        }
        const { data: me } = await client.get('/users/me');
        setUser(me.data);
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    await client.post('/auth/logout').catch(() => undefined);
    tokenStore.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {loading ? <FullPageSpinner /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
