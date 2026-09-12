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
    <header className="h-14 glass-topbar text-slate-800 dark:text-slate-200 flex items-center justify-between px-5 z-20 shrink-0 border-b border-slate-200 dark:border-white/[0.06]">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {breadcrumb.section}
        </h2>
        {breadcrumb.page && (
          <>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{breadcrumb.page}</span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.12] transition-all font-medium text-xs shadow-sm"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Theme</span>
            </>
          )}
        </button>

        {/* All Corridors filter */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-all">
          <span>All Corridors</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Today filter */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-all">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Today</span>
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP'}
          </div>
        </div>
      </div>
    </header>
  );
}
