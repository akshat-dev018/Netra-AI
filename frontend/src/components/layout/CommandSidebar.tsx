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
  Activity,
  BrainCircuit,
  Sliders,
  BarChart3,
  Bot,
  Settings,
} from 'lucide-react';

const sections = [
  {
    title: 'COMMAND',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Network Intelligence', href: '/network', icon: Globe },
      { label: 'Corridor Intelligence', href: '/corridors', icon: Route },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Shipments', href: '/shipments', icon: Package },
      { label: 'Route Optimizer', href: '/routes/optimizer', icon: Navigation },
      { label: 'Disruptions', href: '/disruptions', icon: AlertTriangle, badge: 4 },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'What-If Simulator', href: '/simulator', icon: Sliders },
      { label: 'Predictions', href: '/predictions', icon: BrainCircuit },
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
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                    active
                      ? 'bg-cyan-500/12 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400" />
                  )}
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
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
      <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                item.special
                  ? active
                    ? 'bg-cyan-500/12 text-white'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/[0.06]'
                  : active
                  ? 'bg-cyan-500/12 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400" />
              )}
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  active
                    ? 'text-cyan-400'
                    : item.special
                    ? 'text-cyan-500/60 group-hover:text-cyan-400'
                    : 'text-slate-500 group-hover:text-slate-400'
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
