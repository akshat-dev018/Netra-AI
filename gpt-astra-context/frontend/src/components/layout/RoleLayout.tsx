'use client';

import { useAuth } from '@/auth/AuthProvider';
import { CommandSidebar } from './CommandSidebar';
import { FleetSidebar } from './FleetSidebar';
import { DriverTabBar } from './DriverTabBar';
import { TopBar } from './TopBar';
import { AlertRibbon } from './AlertRibbon';
import Image from 'next/image';

export function RoleLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = user?.role;

  // Auth pages — no portal shell
  if (!user) {
    return <>{children}</>;
  }

  const isDriver = role === 'driver';
  const isFleetManager = role === 'fleet_manager';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      {!isDriver && (
        <aside className="w-64 bg-primary text-white flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/20">
            <Image src="/netra_logo.png" alt="NETRA" width={72} height={64} className="object-contain" priority />
            <p className="text-xs opacity-60">Freight Intelligence</p>
          </div>
          {isFleetManager ? <FleetSidebar /> : <CommandSidebar />}
          <div className="mt-auto p-4 border-t border-white/20">
            <div className="text-xs opacity-60">{user.email}</div>
            <div className="text-xs capitalize">Role: {role}</div>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isDriver && <TopBar />}
        <AlertRibbon />
        <main className="flex-1 overflow-y-auto p-6">
          {isDriver ? <DriverTabBar /> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
