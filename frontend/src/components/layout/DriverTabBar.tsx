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
    <nav className="fixed bottom-0 left-0 right-0 bg-[#070B13]/90 border-t border-white/[0.08] backdrop-blur-xl flex justify-around items-center py-2 px-2 z-50 shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        if (tab.special) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center -mt-6 relative group"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/80 border-2 border-slate-900 group-hover:scale-110 transition-transform relative">
                <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-40" />
                <Icon className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 mt-1 uppercase tracking-wider">
                SOS
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-mono transition-all ${
              isActive
                ? 'text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
