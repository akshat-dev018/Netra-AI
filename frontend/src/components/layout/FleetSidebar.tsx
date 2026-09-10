'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'FLEET MANAGER PORTAL',
    items: [
      { label: 'Fleet Overview', href: '/fleet' },
      { label: 'Vehicles', href: '/fleet/vehicles' },
      { label: 'Drivers', href: '/fleet/drivers' },
      { label: 'Assignments', href: '/fleet/assignments' },
      { label: 'Live Fleet Map', href: '/fleet/map' },
      { label: 'Compliance & Maintenance', href: '/fleet/compliance' },
    ],
  },
];

export function FleetSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="px-4 text-xs font-bold text-[#11315F]/75 uppercase tracking-wider mb-2">{section.title}</div>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href ? 'bg-[#11315F]/12 text-[#11315F] font-semibold' : 'text-[#11315F] hover:bg-[#11315F]/8'
              }`}
            >
              <span className="sidebar-text">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
