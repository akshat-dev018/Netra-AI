'use client';

import { useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { disruptionsApi, emergencyApi } from '@/lib/api';
import { Bell, ChevronDown, Calendar, Sun, Moon, AlertTriangle, Siren, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const breadcrumb = BREADCRUMB_MAP[pathname] || { section: 'FreightIntel Control Tower', page: '' };

  const [selectedCorridor, setSelectedCorridor] = useState('All Corridors');
  const [showCorridorMenu, setShowCorridorMenu] = useState(false);

  const [selectedTimeframe, setSelectedTimeframe] = useState('Today');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const { data: disruptions } = useQuery({
    queryKey: ['topbar-disruptions'],
    queryFn: async () => {
      const res = await disruptionsApi.list({ limit: 5 });
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  const { data: alerts } = useQuery({
    queryKey: ['topbar-alerts'],
    queryFn: async () => {
      const res = await emergencyApi.listAlerts();
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  const rawDisruptions = disruptions || [];
  const rawAlerts = alerts || [];

  const notificationList = [
    ...rawAlerts.map((a: any) => ({
      id: a._id || a.id,
      title: a.description || 'AI Emergency Warning',
      type: 'sos',
      severity: a.severity || 'critical',
      time: 'Recent',
      link: '/emergency',
    })),
    ...rawDisruptions.map((d: any) => ({
      id: d._id || d.id,
      title: d.description || 'Highway Disruption Detected',
      type: 'disruption',
      severity: d.severity || 'high',
      time: 'Active',
      link: '/disruptions',
    })),
  ].filter((item) => !dismissedNotifications.includes(item.id));

  const corridors = [
    'All Corridors',
    'NH-44 Delhi–Agra Spine',
    'NH-48 Delhi–Mumbai Arc',
    'NH-19 Delhi–Kolkata Trunk',
    'NH-27 East-West Connector',
  ];

  const timeframes = ['Today', 'Last 24 Hours', 'This Week', 'This Month'];

  return (
    <header className="h-14 glass-topbar flex items-center justify-between px-5 z-20 shrink-0 relative">
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

        {/* Corridor Selector Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowCorridorMenu(!showCorridorMenu);
              setShowTimeframeMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-subtle bg-card text-xs font-medium text-main hover:bg-primary-50 transition-colors"
          >
            <span>{selectedCorridor}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>
          {showCorridorMenu && (
            <div className="absolute right-0 mt-1 w-52 rounded border border-subtle bg-card shadow-lg py-1 z-50 text-xs">
              {corridors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCorridor(c);
                    setShowCorridorMenu(false);
                    toast.success(`Filter set: ${c}`);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-primary-50 flex items-center justify-between ${
                    selectedCorridor === c ? 'text-primary font-bold bg-primary-50' : 'text-main'
                  }`}
                >
                  <span>{c}</span>
                  {selectedCorridor === c && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe Selector Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowTimeframeMenu(!showTimeframeMenu);
              setShowCorridorMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-subtle bg-card text-xs font-medium text-main hover:bg-primary-50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <span>{selectedTimeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>
          {showTimeframeMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded border border-subtle bg-card shadow-lg py-1 z-50 text-xs">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setSelectedTimeframe(tf);
                    setShowTimeframeMenu(false);
                    toast.success(`Time horizon set to ${tf}`);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-primary-50 flex items-center justify-between ${
                    selectedTimeframe === tf ? 'text-primary font-bold bg-primary-50' : 'text-main'
                  }`}
                >
                  <span>{tf}</span>
                  {selectedTimeframe === tf && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowCorridorMenu(false);
              setShowTimeframeMenu(false);
            }}
            className="relative p-2 rounded border border-subtle bg-card text-main hover:bg-primary-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notificationList.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-critical text-white text-[9px] font-mono font-bold leading-none animate-pulse">
                {notificationList.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-subtle bg-card shadow-2xl p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-subtle">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="font-bold text-main">System Notifications</span>
                </div>
                {notificationList.length > 0 && (
                  <button
                    onClick={() => {
                      setDismissedNotifications(notificationList.map((n) => n.id));
                      toast.success('All notifications marked as read');
                    }}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notificationList.length === 0 ? (
                  <div className="text-center py-6 text-muted">No unread notifications</div>
                ) : (
                  notificationList.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded border border-subtle bg-page flex items-start justify-between gap-2 hover:border-primary transition-all"
                    >
                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(n.link);
                        }}
                        className="cursor-pointer space-y-1 flex-1"
                      >
                        <div className="flex items-center gap-1.5">
                          {n.type === 'sos' ? (
                            <Siren className="w-3.5 h-3.5 text-critical animate-pulse" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                          )}
                          <span className="font-bold text-main">{n.title}</span>
                        </div>
                        <div className="text-[10px] text-muted flex items-center gap-2">
                          <span className="uppercase font-mono text-primary font-semibold">{n.severity}</span>
                          <span>• {n.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setDismissedNotifications((prev) => [...prev, n.id])}
                        className="text-muted hover:text-main p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary">
            {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP'}
          </div>
        </div>
      </div>
    </header>
  );
}

