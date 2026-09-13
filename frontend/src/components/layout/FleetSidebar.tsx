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
          <div className="px-3 text-[10px] font-bold text-on-primary/60 uppercase tracking-widest">
            {section.title}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-white/12 text-on-primary font-semibold border border-white/20'
                    : 'text-on-primary/80 hover:text-on-primary hover:bg-white/8'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-on-primary" />
                )}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
