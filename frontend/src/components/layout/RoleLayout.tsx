'use client';

import { useAuth } from '@/auth/AuthProvider';
import { CommandSidebar } from './CommandSidebar';
import { FleetSidebar } from './FleetSidebar';
import { DriverTabBar } from './DriverTabBar';
import { TopBar } from './TopBar';
import { AlertRibbon } from './AlertRibbon';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function RoleLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = user?.role;
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' ||
    pathname === '/reset-password' || pathname === '/verify-email';

  // Auth pages — no portal shell
  if (!user || isAuthPage) {
    return <>{children}</>;
  }

  const isDriver = role === 'driver';
  const isFleetManager = role === 'fleet_manager';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      {!isDriver && (
        <aside className="hidden w-56 bg-[#DEEBEC] text-[#11315F] flex-col flex-shrink-0 md:flex lg:w-64">
          <div className="p-4 border-b border-[#11315F]/15">
            <Image src="/netra_logo.png" alt="NETRA" width={72} height={64} className="h-auto w-[72px] object-contain" priority />
            <p className="text-xs text-[#11315F]/70">Freight Intelligence</p>
          </div>
          {isFleetManager ? <FleetSidebar /> : <CommandSidebar />}
          <div className="mt-auto p-4 border-t border-[#11315F]/15">
            <div className="text-xs text-[#11315F]/70">{user.email}</div>
            <div className="text-xs capitalize">Role: {role}</div>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isDriver && <TopBar />}
        <AlertRibbon />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {isDriver ? <DriverTabBar /> : null}
          {children}
        </main>
        {!isDriver && (
          <nav className="grid grid-cols-4 border-t border-[#11315F]/15 bg-[#DEEBEC] md:hidden">
            {[
              { label: 'Overview', href: '/dashboard' },
              { label: 'Map', href: '/map' },
              { label: 'Shipments', href: '/shipments' },
              { label: 'Alerts', href: '/emergency/alerts' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-3 text-center text-xs ${pathname === item.href ? 'font-bold text-[#11315F]' : 'text-[#11315F]/75'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
