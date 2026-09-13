'use client';

import { useAuth } from '@/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'driver') {
        router.push('/driver');
      } else if (user.role === 'fleet_manager') {
        router.push('/fleet');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-page text-main">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-primary-200 border-t-primary animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-mono tracking-widest text-muted uppercase">
        CONNECTING TO NETRA CONTROL TOWER...
      </p>
    </div>
  );
}
