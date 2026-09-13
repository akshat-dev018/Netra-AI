'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshClient } from '@/lib/api/refreshClient';
import { tokenStore } from '@/auth/tokenStore';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await refreshClient.post('/auth/register', { name, email, password, role });
      if (data.data?.accessToken) {
        tokenStore.set(data.data.accessToken);
        toast.success('Account created successfully');
        if (role === 'driver') router.push('/driver');
        else if (role === 'fleet_manager') router.push('/fleet');
        else router.push('/dashboard');
      } else {
        toast.success('Registration successful. Please sign in.');
        router.push('/login');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page text-main flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute bottom-10 right-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded bg-card border border-subtle p-2.5 mb-1">
            <Image
              src="/netra_logo.png"
              alt="NETRA"
              width={48}
              height={48}
              className="object-contain "
              priority
            />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-main">
            Provision Operator <span className="text-primary font-mono">NETRA</span>
          </h1>
          <p className="text-xs text-muted">
            Register new personnel to the National Freight Intelligence Network
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel-elevated p-6 sm:p-8 rounded border border-subtle space-y-4 text-xs"
        >
          <div>
            <label className="text-main font-medium block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ramesh Kumar"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main placeholder:text-muted text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-main font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ramesh@netra.local"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main font-mono placeholder:text-muted text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-main font-medium block mb-1.5">Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••••••"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main placeholder:text-muted text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-main font-medium block mb-1.5">System Role Scope</label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main text-xs focus:outline-none bg-card"
              >
                <option value="driver">Driver (Mobile Field Telematics)</option>
                <option value="fleet_manager">Fleet Manager (Depot & Vehicle Ops)</option>
                <option value="controller">Shipment Controller</option>
                <option value="ops_manager">Operations Manager</option>
                <option value="analyst">Risk & Prediction Analyst</option>
                <option value="dispatcher">Emergency Dispatcher</option>
                <option value="viewer">Executive Viewer</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded btn-primary font-semibold text-xs text-on-primary transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Provisioning Account...' : 'Register Operator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 border-t border-subtle">
            <span className="text-muted">Already have an operator account? </span>
            <Link href="/login" className="text-primary hover:text-primary font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
