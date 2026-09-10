'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useColorblind } from '@/contexts/providers/ColorblindProvider';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { user, logout } = useAuth();
  const { isColorblindMode, toggleColorblind } = useColorblind();
  const router = useRouter();

  return (
    <header className="h-16 bg-primary text-white flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">NETRA Control Tower</h2>
        <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">{user?.role}</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Colorblind Toggle */}
        <button
          onClick={toggleColorblind}
          className={`touch-target flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isColorblindMode
              ? 'bg-warning/90 text-primary'
              : 'bg-white/20 hover:bg-white/30'
          }`}
          title={isColorblindMode ? 'Disable Colorblind Mode' : 'Enable Colorblind Mode'}
          aria-pressed={isColorblindMode}
          aria-label="Toggle colorblind-friendly color palette"
        >
          <span className="text-lg">👁️</span>
          <span>Colorblind {isColorblindMode ? 'ON' : 'OFF'}</span>
        </button>
        <button onClick={logout} className="touch-target px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm transition-all">
          Logout
        </button>
      </div>
    </header>
  );
}
