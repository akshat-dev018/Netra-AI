'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await authApi.verifyEmail(token);
      toast.success('Email verified successfully! You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Verification token invalid or expired');
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
            Email Verification
          </h1>
          <p className="text-xs text-muted">
            Validate security credentials to activate operator profile
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="glass-panel-elevated p-6 sm:p-8 rounded border border-subtle space-y-4 text-xs"
        >
          <div>
            <label className="text-main font-medium block mb-1.5">Verification Token</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="Paste verification token..."
                className="glass-input w-full pl-10 pr-3 py-2.5 rounded text-main font-mono placeholder:text-muted text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded btn-success font-semibold text-xs text-white transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify Email & Activate'}</span>
          </button>

          <div className="text-center pt-3 border-t border-subtle">
            <Link href="/login" className="text-xs text-muted hover:text-primary inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}