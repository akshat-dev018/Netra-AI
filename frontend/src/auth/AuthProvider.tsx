'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { client } from '@/lib/api/client';
import { refreshClient } from '@/lib/api/refreshClient';
import { tokenStore } from './tokenStore';
import toast from 'react-hot-toast';

export interface UserData {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'ops_manager' | 'controller' | 'analyst' | 'dispatcher' | 'fleet_manager' | 'driver' | 'viewer';
  fleetId?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  setUser: (user: UserData | null) => void;
  loginWithCredentials: (email: string, pass: string) => Promise<boolean>;
  loginAsDemoRole: (role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEMO_ACCOUNTS: Record<string, { email: string; name: string }> = {
  admin: { email: 'admin@netra.local', name: 'System Admin' },
  ops_manager: { email: 'ops@netra.local', name: 'Ops Manager' },
  controller: { email: 'controller@netra.local', name: 'Network Controller' },
  analyst: { email: 'analyst@netra.local', name: 'Risk Analyst' },
  dispatcher: { email: 'dispatcher@netra.local', name: 'Emergency Dispatcher' },
  fleet_manager: { email: 'fleet@netra.local', name: 'Fleet Manager' },
  driver: { email: 'driver@netra.local', name: 'Demo Driver' },
  viewer: { email: 'viewer@netra.local', name: 'Executive Viewer' },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  loginWithCredentials: async () => false,
  loginAsDemoRole: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    try {
      let token = tokenStore.get();
      if (!token) {
        try {
          const { data: refresh } = await refreshClient.post('/auth/refresh');
          if (refresh?.data?.accessToken) {
            tokenStore.set(refresh.data.accessToken);
            token = refresh.data.accessToken;
          }
        } catch {
          // No active refresh token — auto-authenticate demo admin for zero-friction access
          try {
            const res = await client.post('/auth/login', {
              email: 'admin@netra.local',
              password: 'NetraDemo123!',
            });
            if (res.data.success && res.data.data) {
              tokenStore.set(res.data.data.accessToken);
              setUser(res.data.data.user);
              clearTimeout(safetyTimer);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      if (tokenStore.get()) {
        try {
          const { data: me } = await client.get('/users/me');
          setUser(me.data);
        } catch {
          tokenStore.clear();
          try {
            const res = await client.post('/auth/login', {
              email: 'admin@netra.local',
              password: 'NetraDemo123!',
            });
            if (res.data.success && res.data.data) {
              tokenStore.set(res.data.data.accessToken);
              setUser(res.data.data.user);
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await client.post('/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        const { accessToken, user } = res.data.data;
        tokenStore.set(accessToken);
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return false;
    }
  };

  const loginAsDemoRole = async (roleKey: string): Promise<boolean> => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (!acc) return false;
    const toastId = toast.loading(`Switching to ${acc.name}...`);
    try {
      const res = await client.post('/auth/login', {
        email: acc.email,
        password: 'NetraDemo123!',
      });
      if (res.data.success && res.data.data) {
        const { accessToken, user } = res.data.data;
        tokenStore.set(accessToken);
        setUser(user);
        toast.success(`Switched role to ${user.name} (${user.role})`, { id: toastId });
        return true;
      }
      toast.error('Could not switch role.', { id: toastId });
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Role switch failed', { id: toastId });
      return false;
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch {}
    tokenStore.clear();
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        loginWithCredentials,
        loginAsDemoRole,
        logout,
        refreshUser,
      }}
    >
      {loading ? <FullPageSpinner /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function FullPageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-page text-main">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium tracking-wider text-muted uppercase">
        Initializing NETRA Control Tower...
      </p>
    </div>
  );
}
