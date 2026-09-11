'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) return;
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password updated successfully. Please sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
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
            Set New Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your verification token and select a new security password
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Verification Token</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="Paste reset token..."
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white font-mono placeholder-slate-500 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">New Password (min 8 characters)</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Updating Credentials...' : 'Confirm New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-3 border-t border-white/[0.06]">
            <Link href="/login" className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}