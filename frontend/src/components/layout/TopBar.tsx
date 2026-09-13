'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Calendar, Sun, Moon } from 'lucide-react';

const BREADCRUMB_MAP: Record<string, { section: string; page: string }> = {
  '/dashboard': { section: 'Command Center', page: 'Overview' },
  '/network': { section: 'Command Center', page: 'Network Intelligence' },
  '/corridors': { section: 'Operations', page: 'Corridor Intelligence' },
  '/shipments': { section: 'Operations', page: 'Shipment Intelligence' },
  '/routes': { section: 'Operations', page: 'Route Optimizer' },
  '/disruptions': { section: 'Operations', page: 'Disruptions' },
  '/risk': { section: 'Intelligence', page: 'Risk Monitoring' },
  '/predictions': { section: 'Intelligence', page: 'AI Delay & Accident Forecast' },
  '/simulator': { section: 'Intelligence', page: 'What-If Simulator' },
  '/analytics': { section: 'Analytics', page: 'Analytics' },
  '/reports': { section: 'Analytics', page: 'Reports & Export' },
  '/copilot': { section: 'AI', page: 'FreightIntel Copilot' },
  '/settings': { section: 'Admin', page: 'Settings' },
  '/emergency': { section: 'Emergency', page: 'AI Hospital & Emergency Dispatch' },
  '/emergency/alerts': { section: 'Emergency', page: 'Emergency SOS' },
  '/map': { section: 'Command Center', page: 'Live Interactive Map' },
  '/fleet': { section: 'Fleet', page: 'Fleet Overview' },
};

export function TopBar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const breadcrumb = BREADCRUMB_MAP[pathname] || { section: 'FreightIntel Control Tower', page: '' };

  return (
    <header className="h-14 glass-topbar flex items-center justify-between px-5 z-20 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-bold text-strong truncate">
          {breadcrumb.section}
        </h2>
        {breadcrumb.page && (
          <>
            <span className="text-muted">/</span>
            <span className="text-sm font-medium text-muted truncate">{breadcrumb.page}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-subtle bg-card text-main hover:bg-primary-50 transition-colors font-medium text-xs"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span>Light Theme</span>
            </>
          )}
        </button>

        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded border border-subtle bg-card text-xs font-medium text-main hover:bg-primary-50 transition-colors">
          <span>All Corridors</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        </button>

        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded border border-subtle bg-card text-xs font-medium text-main hover:bg-primary-50 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-muted" />
          <span>Today</span>
        </button>

        <button className="relative p-2 rounded border border-subtle bg-card text-main hover:bg-primary-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-critical" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary">
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP'}
          </div>
        </div>
      </div>
    </header>
  );
}
