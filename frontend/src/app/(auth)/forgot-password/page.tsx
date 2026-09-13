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
    <div className="min-h-screen bg-page text-main flex items-center justify-center p-4 relative overflow-hidden">

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
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
            Recover Credentials
          </h1>
          <p className="text-xs text-muted">
            Dispatches password reset verification token to your registered email
          </p>
        </div>

        <div className="glass-panel-elevated p-6 sm:p-8 rounded border border-subtle space-y-4 text-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-main font-medium block mb-1.5">Registered Operator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="controller@netra.local"
                    className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main font-mono placeholder:text-muted text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded btn-primary font-semibold text-xs text-on-primary transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Request...' : 'Send Recovery Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-success-50 border border-emerald-500/30 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-success">Recovery Instructions Dispatched</div>
              <p className="text-xs text-muted">
                Please check your inbox or demo console for the verification token.
              </p>
            </div>
          )}

          <div className="text-center pt-3 border-t border-subtle">
            <Link href="/login" className="text-xs text-muted hover:text-primary inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}