'use client';

import { useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  Compass,
  BarChart3,
  AlertCircle,
  Truck,
  Navigation,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    email: 'admin@netra.local',
    role: 'Full System Control',
    icon: Shield,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400',
  },
  {
    key: 'controller',
    label: 'Controller',
    email: 'controller@netra.local',
    role: 'Shipment Control',
    icon: Compass,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300 hover:border-cyan-400',
  },
  {
    key: 'dispatcher',
    label: 'Dispatcher',
    email: 'dispatcher@netra.local',
    role: 'Emergency SOS',
    icon: AlertCircle,
    color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300 hover:border-rose-400',
  },
  {
    key: 'fleet_manager',
    label: 'Fleet Mgr',
    email: 'fleet@netra.local',
    role: 'Depot & Vehicles',
    icon: Truck,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400',
  },
  {
    key: 'driver',
    label: 'Driver',
    email: 'driver@netra.local',
    role: 'Mobile Telematics',
    icon: Navigation,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400',
  },
  {
    key: 'analyst',
    label: 'Analyst',
    email: 'analyst@netra.local',
    role: 'Risk Engine',
    icon: BarChart3,
    color: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-300 hover:border-blue-400',
  },
];

const METRICS = [
  { label: 'Corridors Monitored', val: '14 Active', icon: Globe2 },
  { label: 'Telematics Latency', val: '< 1.2s', icon: Zap },
  { label: 'ETA Prediction', val: '99.8% Acc', icon: Activity },
];

export default function LoginPage() {
  const { loginWithCredentials, loginAsDemoRole } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    const ok = await loginWithCredentials(email, password);
    setLoading(false);
    if (ok) {
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = async (roleKey: string) => {
    setRoleLoading(roleKey);
    const ok = await loginAsDemoRole(roleKey);
    setRoleLoading(null);
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
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Branding, Vision, Telematics Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left hidden lg:block animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            NATIONAL HIGHWAYS FREIGHT INTEL • v1.0
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center p-2.5 shadow-xl shadow-cyan-500/10">
                <Image
                  src="/netra_logo.png"
                  alt="NETRA"
                  width={48}
                  height={48}
                  className="object-contain filter invert brightness-200"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
                  FreightIntel <span className="text-gradient font-mono">NETRA</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono tracking-wider">
                  AI CONTROL TOWER & TELEMATICS PLATFORM
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time corridor telemetry, multi-modal disruption intelligence, predictive ETA modeling,
              and coordinated emergency response across Indian national highways.
            </p>
          </div>

          {/* Key Metrics Chips */}
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="glass-card p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <Icon className="w-4 h-4 text-cyan-400 mb-1.5" />
                  <div className="text-xs font-bold text-white font-mono">{m.val}</div>
                  <div className="text-[10px] text-slate-400">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Feature Badges */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated bottleneck resolution & dynamic rerouting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-role access for Dispatchers, Fleet Managers, and Drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Integrated with Golden Quadrilateral & NH telematics sensors</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Panel with 1-Click Roles + Sign In */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto space-y-5 animate-slide-in-right">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-2 shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
              <Image
                src="/netra_logo.png"
                alt="NETRA"
                width={40}
                height={40}
                className="object-contain filter invert brightness-200"
                priority
              />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              FreightIntel <span className="text-cyan-400 font-mono">NETRA</span>
            </h1>
            <p className="text-xs text-slate-400">Sign in to National Control Tower</p>
          </div>

          {/* 1-Click Demo Logins Panel */}
          <div className="glass-panel-elevated p-4 rounded-2xl border border-white/[0.08] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 1-Click Demo Role Logins
              </span>
              <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                Pass: NetraDemo123!
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((r) => {
                const Icon = r.icon;
                const isThisLoading = roleLoading === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    disabled={Boolean(roleLoading)}
                    onClick={() => handleQuickLogin(r.key)}
                    className={`p-2.5 rounded-xl border bg-gradient-to-br text-left transition-all duration-200 ${r.color} hover:scale-[1.02] flex items-center gap-2 relative overflow-hidden group`}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-white">{r.label}</div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">{r.role}</div>
                    </div>
                    {isThisLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Credentials Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Operator Sign In
              </span>
              <span className="text-[11px] text-slate-400">Enterprise Credentials</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Operator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="controller@netra.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Operator...' : 'Sign In to Control Tower'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center border-t border-white/[0.06] text-xs">
              <span className="text-slate-400">Need new operator access? </span>
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Register Operator
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
