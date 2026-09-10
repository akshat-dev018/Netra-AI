'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'COMMAND CENTER',
    items: [
      { label: 'Overview', href: '/dashboard', icon: '📊' },
      { label: 'National Network', href: '/network', icon: '🌐' },
      { label: 'Live Map', href: '/map', icon: '🗺️' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Shipments', href: '/shipments', icon: '📦' },
      { label: 'Route Optimizer', href: '/routes/optimizer', icon: '⚡' },
      { label: 'Corridor Intelligence', href: '/corridors', icon: '🛣️' },
      { label: 'Disruptions', href: '/disruptions', icon: '⚠️' },
    ],
  },
  {
    title: 'RISK & PREDICTION',
    items: [
      { label: 'Risk Monitoring', href: '/risk', icon: '📉' },
      { label: 'Accident Risk', href: '/risk/accidents', icon: '🔬' },
      { label: 'Predictions', href: '/predictions', icon: '🔮' },
      { label: 'What-If Simulator', href: '/simulator', icon: '🧪' },
    ],
  },
  {
    title: 'EMERGENCY RESPONSE',
    items: [
      { label: 'Emergency Alerts', href: '/emergency/alerts', icon: '🚨' },
      { label: 'Hospital Network', href: '/emergency/hospitals', icon: '🏥' },
      { label: 'Response Monitoring', href: '/emergency/response', icon: '🚑' },
    ],
  },
  {
    title: 'ANALYTICS & AI',
    items: [
      { label: 'Analytics', href: '/analytics', icon: '📈' },
      { label: 'Reports', href: '/reports', icon: '📋' },
      { label: 'NETRA Copilot', href: '/copilot', icon: '🤖' },
    ],
  },
];

export function CommandSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="px-4 text-xs font-bold text-white/40 uppercase tracking-wider mb-2">{section.title}</div>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
