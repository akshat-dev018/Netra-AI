'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Route,
  Package,
  Navigation,
  AlertTriangle,
  Siren,
  Map,
  BrainCircuit,
  Sliders,
  BarChart3,
  Bot,
  Settings,
} from 'lucide-react';

const sections = [
  {
    title: 'COMMAND CONTROL',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Live Map', href: '/map', icon: Map },
      { label: 'Network Intelligence', href: '/network', icon: Globe },
      { label: 'Corridor Risk Control', href: '/corridors', icon: Route },
    ],
  },
  {
    title: 'EMERGENCY & OPERATIONS',
    items: [
      { label: 'Hospital & Emergency Alert', href: '/emergency', icon: Siren, badge: 'AI' },
      { label: 'Route Optimizer', href: '/routes', icon: Navigation },
      { label: 'Shipments', href: '/shipments', icon: Package },
      { label: 'Disruptions', href: '/disruptions', icon: AlertTriangle, badge: '4' },
    ],
  },
  {
    title: 'AI INTELLIGENCE',
    items: [
      { label: 'AI Delay & Accident Forecast', href: '/predictions', icon: BrainCircuit },
      { label: 'What-If Simulator', href: '/simulator', icon: Sliders },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
];

const bottomItems = [
  { label: 'AI Freight Copilot', href: '/copilot', icon: Bot, special: true },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function CommandSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="flex-1 flex flex-col overflow-y-auto py-4 px-3 no-scrollbar">
      <div className="space-y-6 flex-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 rounded-r-full bg-cyan-600 dark:bg-cyan-400" />
                  )}
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      active ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span
                      className={`ml-auto flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badge === 'AI'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom items */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/[0.06] space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${
                item.special
                  ? active
                    ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.08]'
                  : active
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-5 rounded-r-full bg-cyan-600 dark:bg-cyan-400" />
              )}
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  active
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : item.special
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
