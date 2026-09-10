'use client';

import { useAuth } from '@/auth/AuthProvider';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="min-h-16 bg-[#DEEBEC] text-[#11315F] flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 shadow-sm border-b border-[#11315F]/15">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <h2 className="truncate text-base font-semibold sm:text-lg">NETRA Control Tower</h2>
        <span className="text-xs bg-[#11315F]/10 px-2 py-1 rounded capitalize">{user?.role}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={logout} className="touch-target px-3 py-1.5 rounded-lg bg-[#11315F]/10 hover:bg-[#11315F]/15 text-sm transition-all">
          Logout
        </button>
      </div>
    </header>
  );
}
