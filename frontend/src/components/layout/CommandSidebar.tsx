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
            <div className="px-3 pb-1.5 text-[10px] font-bold text-on-primary/60 uppercase tracking-[0.15em]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-semibold transition-colors group relative ${
                    active
                      ? 'bg-white/12 text-on-primary border border-white/20'
                      : 'text-on-primary/80 hover:text-on-primary hover:bg-white/8'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-on-primary" />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span
                      className={`ml-auto flex items-center justify-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                        item.badge === 'AI'
                          ? 'bg-warning/20 text-on-primary border border-warning/40'
                          : 'bg-critical/25 text-on-primary'
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

      <div className="mt-auto pt-4 border-t border-white/15 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-semibold transition-colors group relative ${
                active
                  ? 'bg-white/12 text-on-primary border border-white/20'
                  : 'text-on-primary/80 hover:text-on-primary hover:bg-white/8'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-on-primary" />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
