'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch {
      setSubmitted(true);
      toast.success('If that email exists, reset instructions have been dispatched');
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
            Recover Credentials
          </h1>
          <p className="text-xs text-slate-400">
            Dispatches password reset verification token to your registered email
          </p>
        </div>

        <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl space-y-4 text-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Registered Operator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="controller@netra.local"
                    className="glass-input w-full pl-10 pr-3 py-2.5 rounded-xl text-white font-mono placeholder-slate-500 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Request...' : 'Send Recovery Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-emerald-400">Recovery Instructions Dispatched</div>
              <p className="text-xs text-slate-400">
                Please check your inbox or demo console for the verification token.
              </p>
            </div>
          )}

          <div className="text-center pt-3 border-t border-white/[0.06]">
            <Link href="/login" className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}