'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, Radio, Hospital, AlertOctagon, User } from 'lucide-react';

const tabs = [
  { label: 'Trip', href: '/driver', icon: Navigation },
  { label: 'GPS Live', href: '/location', icon: Radio },
  { label: 'SOS', href: '/sos', icon: AlertOctagon, special: true },
  { label: 'Trauma Hub', href: '/hospitals', icon: Hospital },
  { label: 'Profile', href: '/profile', icon: User },
];

export function DriverTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-white/15 flex justify-around items-center py-2 px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        if (tab.special) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center -mt-6 relative"
            >
              <div className="w-13 h-13 rounded-full bg-critical text-white flex items-center justify-center border-2 border-sidebar">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-on-primary mt-1 uppercase tracking-wider">
                SOS
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[11px] font-mono ${
              isActive
                ? 'text-on-primary font-bold bg-white/12 border border-white/20'
                : 'text-on-primary/70 hover:text-on-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
