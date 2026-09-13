'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Shield, Activity, Compass, BarChart3, AlertCircle, Truck, Navigation, Eye } from 'lucide-react';

const ROLES = [
  { key: 'admin', label: 'Admin', icon: Shield },
  { key: 'ops_manager', label: 'Ops Mgr', icon: Activity },
  { key: 'controller', label: 'Controller', icon: Compass },
  { key: 'analyst', label: 'Analyst', icon: BarChart3 },
  { key: 'dispatcher', label: 'Dispatcher', icon: AlertCircle },
  { key: 'fleet_manager', label: 'Fleet Mgr', icon: Truck },
  { key: 'driver', label: 'Driver', icon: Navigation },
  { key: 'viewer', label: 'Viewer', icon: Eye },
];

export function DemoRoleSwitcher() {
  const { user, loginAsDemoRole } = useAuth();
  const router = useRouter();

  const handleSwitch = async (roleKey: string) => {
    if (user?.role === roleKey) return;
    const ok = await loginAsDemoRole(roleKey);
    if (ok) {
      if (roleKey === 'driver') {
        router.push('/driver');
      } else if (roleKey === 'fleet_manager') {
        router.push('/fleet');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="bg-sidebar border-b border-white/15 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs">
      <div className="flex items-center gap-1.5 shrink-0 text-on-primary/70 font-semibold uppercase tracking-wider text-[10px]">
        <span className="inline-block w-2 h-2 rounded-full bg-success" />
        <span>Demo Switcher:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = user?.role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => handleSwitch(r.key)}
              title={`Switch to ${r.label} role`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm transition-colors border shrink-0 font-medium ${
                isActive
                  ? 'bg-white/15 text-on-primary border-white/30'
                  : 'bg-transparent text-on-primary/75 border-white/10 hover:border-white/30 hover:text-on-primary'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
