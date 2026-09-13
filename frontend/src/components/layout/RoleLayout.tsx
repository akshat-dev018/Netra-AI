'use client';

import { useAuth } from '@/auth/AuthProvider';
import { CommandSidebar } from './CommandSidebar';
import { FleetSidebar } from './FleetSidebar';
import { DriverTabBar } from './DriverTabBar';
import { TopBar } from './TopBar';
import { AlertRibbon } from './AlertRibbon';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function RoleLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-page text-main">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary animate-spin" />
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-muted uppercase">
          NETRA CONTROL TOWER INITIALIZING...
        </p>
      </div>
    );
  }

  const role = user?.role;
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';

  if (!user || isAuthPage) {
    return <>{children}</>;
  }

  const isDriver = role === 'driver';
  const isFleetManager = role === 'fleet_manager';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-page text-main">
      <DemoRoleSwitcher />

      <div className="flex flex-1 overflow-hidden">
        {!isDriver && (
          <aside className="hidden md:flex w-60 lg:w-64 glass-sidebar flex-col flex-shrink-0 z-30">
            <div className="p-4 border-b border-white/15 flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-white/20 flex items-center justify-center p-1.5 bg-primary-800">
                <Image
                  src="/netra_logo.png"
                  alt="NETRA"
                  width={32}
                  height={32}
                  className="object-contain invert brightness-200"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-on-primary font-sans">FreightIntel</h1>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/20 text-on-primary font-mono font-bold">
                    NETRA AI
                  </span>
                </div>
                <p className="text-[11px] font-medium text-on-primary/75 truncate">Control Tower Command</p>
              </div>
            </div>

            {isFleetManager ? <FleetSidebar /> : <CommandSidebar />}

            <div className="mt-auto p-3 border-t border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-800 border border-white/20 text-on-primary flex items-center justify-center text-xs font-bold font-mono">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-on-primary truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-on-primary/75 truncate uppercase tracking-wider font-semibold">
                    {role?.replace('_', ' ') || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-page">
          {!isDriver && <TopBar />}
          <AlertRibbon />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 relative pb-20 md:pb-6">
            {children}
          </main>
          {isDriver && <DriverTabBar />}
        </div>
      </div>
    </div>
  );
}
