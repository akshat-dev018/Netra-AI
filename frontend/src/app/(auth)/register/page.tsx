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
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 p-2.5 shadow-xl shadow-cyan-500/10 mb-1">
            <Image
              src="/netra_logo.png"
              alt="NETRA"
              width={48}
              height={48}
              className="object-contain filter invert brightness-200"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white">
            Provision Operator <span className="text-cyan-400 font-mono">NETRA</span>
          </h1>
          <p className="text-xs text-slate-400">
            Register new personnel to the National Freight Intelligence Network
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ramesh Kumar"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ramesh@netra.local"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white font-mono placeholder-slate-500 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••••••"
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">System Role Scope</label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Provisioning Account...' : 'Register Operator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 border-t border-white/[0.06]">
            <span className="text-slate-400">Already have an operator account? </span>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
