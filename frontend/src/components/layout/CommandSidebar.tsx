'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'COMMAND CENTER',
    items: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'National Network', href: '/network' },
      { label: 'Live Map', href: '/map' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Shipments', href: '/shipments' },
      { label: 'Route Optimizer', href: '/routes/optimizer' },
      { label: 'Corridor Intelligence', href: '/corridors' },
      { label: 'Disruptions', href: '/disruptions' },
    ],
  },
  {
    title: 'RISK & PREDICTION',
    items: [
      { label: 'Risk Monitoring', href: '/risk' },
      { label: 'Accident Risk', href: '/risk/accidents' },
      { label: 'Predictions', href: '/predictions' },
      { label: 'What-If Simulator', href: '/simulator' },
    ],
  },
  {
    title: 'EMERGENCY RESPONSE',
    items: [
      { label: 'Emergency Alerts', href: '/emergency/alerts' },
      { label: 'Hospital Network', href: '/emergency/hospitals' },
      { label: 'Response Monitoring', href: '/emergency/response' },
    ],
  },
  {
    title: 'ANALYTICS & AI',
    items: [
      { label: 'Analytics', href: '/analytics' },
      { label: 'Reports', href: '/reports' },
      { label: 'NETRA Copilot', href: '/copilot' },
    ],
  },
];

export function CommandSidebar() {
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
