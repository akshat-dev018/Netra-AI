'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Shield, Activity, Compass, BarChart3, AlertCircle, Truck, Navigation, Eye } from 'lucide-react';

const ROLES = [
  { key: 'admin', label: 'Admin', icon: Shield, color: 'hover:border-purple-500 hover:text-purple-400', activeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
  { key: 'ops_manager', label: 'Ops Mgr', icon: Activity, color: 'hover:border-blue-500 hover:text-blue-400', activeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
  { key: 'controller', label: 'Controller', icon: Compass, color: 'hover:border-cyan-500 hover:text-cyan-400', activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
  { key: 'analyst', label: 'Analyst', icon: BarChart3, color: 'hover:border-indigo-500 hover:text-indigo-400', activeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' },
  { key: 'dispatcher', label: 'Dispatcher', icon: AlertCircle, color: 'hover:border-rose-500 hover:text-rose-400', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50' },
  { key: 'fleet_manager', label: 'Fleet Mgr', icon: Truck, color: 'hover:border-amber-500 hover:text-amber-400', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
  { key: 'driver', label: 'Driver', icon: Navigation, color: 'hover:border-emerald-500 hover:text-emerald-400', activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
  { key: 'viewer', label: 'Viewer', icon: Eye, color: 'hover:border-slate-500 hover:text-slate-400', activeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/50' },
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
    <div className="bg-[#090E17]/90 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs backdrop-blur-md">
      <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-150 border shrink-0 font-medium ${
                isActive
                  ? r.activeBg
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 ' + r.color
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{r.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-current ml-0.5 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
