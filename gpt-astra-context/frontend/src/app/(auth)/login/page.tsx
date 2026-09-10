'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshClient } from '@/lib/api/refreshClient';
import { tokenStore } from '@/auth/tokenStore';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await refreshClient.post('/auth/login', { email, password });
      tokenStore.set(data.data.accessToken);
      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07131d] lg:flex">
      <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[58%] lg:flex-col lg:justify-between px-12 py-11 text-white xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_44%,rgba(24,116,201,0.25),transparent_28%),linear-gradient(145deg,#071b2a_0%,#06131d_58%,#03080d_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(112,187,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(112,187,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-24 top-1/3 h-[34rem] w-[34rem] rounded-full border border-cyan-300/10 shadow-[0_0_100px_rgba(25,145,225,0.14)]" />
        <div className="absolute right-20 top-[41%] h-64 w-64 rounded-full border border-cyan-300/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f73d9] shadow-lg shadow-blue-950/40">
            <span className="text-xl font-bold">N</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">NETRA</span>
        </div>
        <div className="relative z-10 max-w-xl pb-4">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">National intelligence platform</p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
            See the road ahead.
            <br />
            <span className="text-cyan-300">Move with confidence.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            One command center for freight corridors, emergency response, and predictive risk intelligence.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm text-slate-200">
            {['Live corridor intelligence', 'Predictive risk signals', 'Faster emergency response'].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <span className="mr-2 text-cyan-300">●</span>{item}
              </span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs tracking-wide text-slate-500">Secure operations workspace · Built for the road network</p>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] px-6 py-12 sm:px-10 lg:w-[42%]">
        <div className="w-full max-w-[390px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f73d9] text-xl font-bold text-white">N</div>
            <span className="text-xl font-semibold text-[#11233b]">NETRA</span>
          </div>
          <div className="mb-9">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2f73d9]">Command center</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#132238]">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue to your operations workspace.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#273852]">Email address</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">✉</span>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3.5 text-sm text-[#132238] outline-none transition focus:border-[#2f73d9] focus:ring-4 focus:ring-blue-100"
                  placeholder="you@netra.gov" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#273852]">Password</label>
                <a href="/forgot-password" className="text-xs font-medium text-[#2f73d9] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">▣</span>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3.5 text-sm text-[#132238] outline-none transition focus:border-[#2f73d9] focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your password" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#2f73d9]" />
              Keep me signed in
            </label>
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2f73d9] py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#2564c2] disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>
          <div className="my-8 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or continue with <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300">Google</button>
            <button type="button" className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300">Microsoft</button>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">Don&apos;t have an account? <a href="/register" className="font-medium text-[#2f73d9] hover:underline">Create one</a></p>
        </div>
      </section>
    </div>
  );
}
