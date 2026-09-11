'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Calendar, RefreshCw, Search } from 'lucide-react';

const BREADCRUMB_MAP: Record<string, { section: string; page: string }> = {
  '/dashboard': { section: 'Command Center', page: 'Overview' },
  '/network': { section: 'Command Center', page: 'Network Intelligence' },
  '/corridors': { section: 'Operations', page: 'Corridor Intelligence' },
  '/shipments': { section: 'Operations', page: 'Shipment Intelligence' },
  '/routes/optimizer': { section: 'Operations', page: 'Route Optimizer' },
  '/disruptions': { section: 'Operations', page: 'Disruptions' },
  '/risk': { section: 'Intelligence', page: 'Risk Monitoring' },
  '/risk/accidents': { section: 'Intelligence', page: 'Accident Density' },
  '/predictions': { section: 'Intelligence', page: 'AI Delay Forecast' },
  '/simulator': { section: 'Intelligence', page: 'What-If Simulator' },
  '/analytics': { section: 'Analytics', page: 'Analytics' },
  '/reports': { section: 'Analytics', page: 'Reports & Export' },
  '/copilot': { section: 'AI', page: 'FreightIntel Copilot' },
  '/settings': { section: 'Admin', page: 'Settings' },
  '/emergency/alerts': { section: 'Emergency', page: 'Emergency SOS' },
  '/emergency/hospitals': { section: 'Emergency', page: 'Hospital Network' },
  '/emergency/response': { section: 'Emergency', page: 'Response Units' },
  '/map': { section: 'Command Center', page: 'Live Map' },
  '/fleet': { section: 'Fleet', page: 'Fleet Overview' },
  '/fleet/vehicles': { section: 'Fleet', page: 'Vehicles' },
  '/fleet/drivers': { section: 'Fleet', page: 'Drivers' },
  '/fleet/assignments': { section: 'Fleet', page: 'Assignments' },
  '/fleet/map': { section: 'Fleet', page: 'Fleet Map' },
  '/fleet/compliance': { section: 'Fleet', page: 'Compliance' },
};

export function TopBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumb = BREADCRUMB_MAP[pathname] || { section: 'FreightIntel', page: '' };

  return (
    <header className="h-14 glass-topbar text-slate-200 flex items-center justify-between px-5 z-20 shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-semibold text-white truncate">
          {breadcrumb.section}
        </h2>
        {breadcrumb.page && (
          <>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-400 truncate">{breadcrumb.page}</span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* All Corridors filter */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-300 hover:bg-white/[0.07] transition-all">
          <span>All Corridors</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* Today filter */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-300 hover:bg-white/[0.07] transition-all">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Today</span>
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'OT'}
          </div>
        </div>
      </div>
    </header>
  );
}
