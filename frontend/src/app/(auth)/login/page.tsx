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
  Zap,
  Globe2,
  Activity,
  CheckCircle2,
  Radio,
  Siren,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ROLES = [
  { key: 'admin', label: 'Admin', email: 'admin@netra.local', role: 'Full System Control', icon: Shield },
  { key: 'controller', label: 'Controller', email: 'controller@netra.local', role: 'Shipment Control', icon: Compass },
  { key: 'dispatcher', label: 'Dispatcher', email: 'dispatcher@netra.local', role: 'Emergency SOS', icon: AlertCircle },
  { key: 'fleet_manager', label: 'Fleet Mgr', email: 'fleet@netra.local', role: 'Depot & Vehicles', icon: Truck },
  { key: 'driver', label: 'Driver', email: 'driver@netra.local', role: 'Mobile Telematics', icon: Navigation },
  { key: 'analyst', label: 'Analyst', email: 'analyst@netra.local', role: 'Risk Engine', icon: BarChart3 },
];

const METRICS = [
  { label: 'Corridors Monitored', val: '14', sub: 'National highways live', icon: Globe2 },
  { label: 'Telematics Latency', val: '< 1.2s', sub: 'Vehicle ping interval', icon: Zap },
  { label: 'ETA Prediction', val: '99.8%', sub: 'Model accuracy (rolling)', icon: Activity },
  { label: 'SOS Coverage', val: '24/7', sub: 'Hospital dispatch desk', icon: Siren },
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
    <div className="min-h-screen bg-page text-main">
      <div className="min-h-screen w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 px-6 sm:px-10 lg:px-14 xl:px-16 py-8 lg:py-0 lg:items-stretch">
        <section className="hidden lg:flex flex-col justify-center py-12">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-sm bg-primary-50 border border-subtle text-primary text-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-success" />
            NATIONAL HIGHWAYS FREIGHT INTEL • v1.0
          </div>

          <div className="mt-8 flex items-start gap-5">
            <div className="w-16 h-16 rounded border border-subtle bg-card flex items-center justify-center p-2 shrink-0">
              <Image src="/netra_logo.png" alt="NETRA" width={56} height={56} className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-strong leading-tight">
                FreightIntel NETRA
              </h1>
              <p className="mt-2 text-sm xl:text-base text-muted font-mono tracking-[0.14em] uppercase">
                AI Control Tower & Telematics Platform
              </p>
            </div>
          </div>

          <p className="mt-8 text-base xl:text-lg text-main leading-relaxed max-w-xl">
            Real-time corridor telemetry, multi-modal disruption intelligence, predictive ETA modeling,
            and coordinated emergency response across Indian national highways.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="glass-card p-5">
                  <Icon className="w-5 h-5 text-primary mb-3" />
                  <div className="text-2xl font-bold text-strong font-mono tracking-tight">{m.val}</div>
                  <div className="mt-1 text-sm font-semibold text-main">{m.label}</div>
                  <div className="text-xs text-muted mt-0.5">{m.sub}</div>
                </div>
              );
            })}
          </div>

          <ul className="mt-10 space-y-3 text-sm xl:text-base text-main border-t border-subtle pt-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span>Automated bottleneck resolution and dynamic rerouting for active dispatches</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span>Multi-role access for dispatchers, fleet managers, controllers, and drivers</span>
            </li>
            <li className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Integrated with Golden Quadrilateral and NH telematics sensors</span>
            </li>
          </ul>
        </section>

        <section className="flex flex-col justify-center py-6 lg:py-12">
          <div className="w-full max-w-md lg:max-w-lg mx-auto space-y-5">
            <div className="lg:hidden text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded border border-subtle bg-card p-2">
                <Image src="/netra_logo.png" alt="NETRA" width={40} height={40} className="object-contain" priority />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-strong">FreightIntel NETRA</h1>
              <p className="text-sm text-muted">Sign in to National Control Tower</p>
            </div>

            <div className="glass-panel-elevated p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  1-Click Demo Role Logins
                </span>
                <span className="text-[10px] text-muted font-mono bg-primary-50 px-2 py-0.5 rounded-sm border border-subtle shrink-0">
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
                      className="p-3 rounded border border-subtle bg-card text-left hover:bg-primary-50 flex items-center gap-2 relative overflow-hidden"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate text-strong">{r.label}</div>
                        <div className="text-[11px] text-muted truncate">{r.role}</div>
                      </div>
                      {isThisLoading && (
                        <div className="absolute inset-0 bg-card/80 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-subtle">
                <span className="text-sm font-semibold text-strong uppercase tracking-wider">Operator Sign In</span>
                <span className="text-xs text-muted">Enterprise Credentials</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-main font-medium block mb-1.5">Operator Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="email"
                      placeholder="controller@netra.local"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full pl-10 pr-3 py-2.5 text-main font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-main font-medium">Password</label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input w-full pl-10 pr-3 py-2.5 text-main text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Operator...' : 'Sign In to Control Tower'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center border-t border-subtle text-sm">
                <span className="text-muted">Need new operator access? </span>
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Register Operator
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
