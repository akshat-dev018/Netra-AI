'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'My Trip', href: '/driver', icon: '📋' },
  { label: 'Share My Location', href: '/driver/location', icon: '📍' },
  { label: 'Nearby Hospitals', href: '/driver/hospitals', icon: '🏥' },
  { label: 'SOS / Report', href: '/driver/sos', icon: '🚨' },
  { label: 'My Profile', href: '/driver/profile', icon: '👤' },
];

export function DriverTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary text-white flex justify-around py-2 shadow-lg z-50">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 text-xs transition-colors touch-target ${
            pathname === tab.href ? 'text-white' : 'text-white/60'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
