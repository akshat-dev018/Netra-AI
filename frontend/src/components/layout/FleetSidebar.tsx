'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Users, CalendarCheck, Map, ShieldCheck, LayoutDashboard } from 'lucide-react';

const sections = [
  {
    title: 'FLEET OPERATIONS',
    items: [
      { label: 'Fleet Overview', href: '/fleet', icon: LayoutDashboard },
      { label: 'Vehicles Fleet', href: '/fleet/vehicles', icon: Truck },
      { label: 'Drivers Roster', href: '/fleet/drivers', icon: Users },
      { label: 'Trip Assignments', href: '/fleet/assignments', icon: CalendarCheck },
      { label: 'Live Fleet Map', href: '/fleet/map', icon: Map },
      { label: 'Compliance & Safety', href: '/fleet/compliance', icon: ShieldCheck },
    ],
  },
];

export function FleetSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {section.title}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-amber-500/12 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
                )}
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
