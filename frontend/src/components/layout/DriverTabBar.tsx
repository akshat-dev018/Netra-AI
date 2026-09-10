'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'My Trip', href: '/driver' },
  { label: 'Share My Location', href: '/driver/location' },
  { label: 'Nearby Hospitals', href: '/driver/hospitals' },
  { label: 'SOS / Report', href: '/driver/sos' },
  { label: 'My Profile', href: '/driver/profile' },
];

export function DriverTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#DEEBEC] text-[#11315F] flex justify-around py-2 shadow-lg border-t border-[#11315F]/15 z-50">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 text-xs transition-colors touch-target ${
            pathname === tab.href ? 'text-[#11315F] font-semibold' : 'text-[#11315F]/80'
          }`}
        >
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
