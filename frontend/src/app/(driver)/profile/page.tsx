'use client';

import { useAuth } from '@/auth/AuthProvider';
import {
  User,
  Truck,
  ShieldCheck,
  Phone,
  CreditCard,
  LogOut,
  Award,
  FileCheck,
  Clock,
  Calendar,
} from 'lucide-react';

export default function DriverProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-main font-mono tracking-tight">
            COMMERCIAL PILOT PROFILE & CREDENTIALS
          </h1>
        </div>
        <p className="text-xs text-muted mt-1">
          Digital driver badge, heavy commercial vehicle pairing, and statutory compliance status.
        </p>
      </div>

      {/* Main Profile Glass Card */}
      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded bg-card border border-subtle text-primary flex items-center justify-center font-bold font-mono text-xl ">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-main">{user?.name || 'Rajesh Kumar (Pilot)'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-success-50 border border-emerald-500/30 text-success text-[10px] font-mono font-bold">
                GRADE-A
              </span>
            </div>
            <div className="text-xs text-primary font-mono mt-0.5">{user?.email || 'driver@netra.local'}</div>
            <div className="text-[11px] text-muted mt-0.5">Assigned Depot: ICD Tughlakabad, New Delhi</div>
          </div>
        </div>

        {/* Credentials Breakdown */}
        <div className="space-y-2.5 text-xs pt-3 border-t border-subtle">
          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-muted">Commercial Heavy License:</span>
            <span className="font-mono font-bold text-main">DL-2021-008912 (HMV Valid)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-muted">License Expiry Date:</span>
            <span className="font-mono text-main">18-Oct-2028 (Central MoRTH Verified)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-muted">Assigned Freight Vehicle:</span>
            <span className="font-mono font-bold text-warning">DL01AB1234 (Tata Prima 4028.S 18T)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-muted">Safety & Defensive Driving Score:</span>
            <span className="font-mono font-bold text-success">98 / 100 (Top 2% Fleet Pilot)</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-muted">Today&apos;s Hours of Service (HOS):</span>
            <span className="font-mono font-bold text-primary">5.5 hrs used (3.5 hrs remaining)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={logout}
          className="w-full py-3 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-critical font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>SIGN OUT OF DRIVER TERMINAL</span>
        </button>
      </div>
    </div>
  );
}
