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
import Link from 'next/link';
import { Shield, Radio, Truck, Activity } from 'lucide-react';

export function RoleLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#070B13] text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
          <div className="absolute w-8 h-8 rounded-full bg-cyan-500/20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-cyan-400 uppercase">
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

  // Auth pages — render bare layout
  if (!user || isAuthPage) {
    return <>{children}</>;
  }

  const isDriver = role === 'driver';
  const isFleetManager = role === 'fleet_manager';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#070B13] text-slate-100">
      {/* 1-Click Demo Switcher Bar across all screens */}
      <DemoRoleSwitcher />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop Command & Fleet Portals */}
        {!isDriver && (
          <aside className="hidden md:flex w-60 lg:w-64 glass-sidebar flex-col flex-shrink-0 z-30">
            {/* Logo & Platform Badge */}
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/10">
                <Image
                  src="/netra_logo.png"
                  alt="NETRA"
                  width={32}
                  height={32}
                  className="object-contain filter invert brightness-200"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-white font-sans">FreightIntel</h1>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-medium">
                    NETRA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Freight Intelligence Control</p>
              </div>
            </div>

            {/* Portal Navigation based on active role */}
            {isFleetManager ? <FleetSidebar /> : <CommandSidebar />}

            {/* User Session Footer */}
            <div className="mt-auto p-3 border-t border-white/[0.06] bg-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono shadow-inner">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-200 truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400/80 truncate uppercase tracking-wider">
                    {role?.replace('_', ' ') || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
