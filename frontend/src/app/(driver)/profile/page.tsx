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
          <User className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            COMMERCIAL PILOT PROFILE & CREDENTIALS
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Digital driver badge, heavy commercial vehicle pairing, and statutory compliance status.
        </p>
      </div>

      {/* Main Profile Glass Card */}
      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold font-mono text-xl shadow-lg shadow-cyan-500/10">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{user?.name || 'Rajesh Kumar (Pilot)'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                GRADE-A
              </span>
            </div>
            <div className="text-xs text-cyan-400 font-mono mt-0.5">{user?.email || 'driver@netra.local'}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Assigned Depot: ICD Tughlakabad, New Delhi</div>
          </div>
        </div>

        {/* Credentials Breakdown */}
        <div className="space-y-2.5 text-xs pt-3 border-t border-white/[0.08]">
          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-slate-400">Commercial Heavy License:</span>
            <span className="font-mono font-bold text-white">DL-2021-008912 (HMV Valid)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-slate-400">License Expiry Date:</span>
            <span className="font-mono text-slate-200">18-Oct-2028 (Central MoRTH Verified)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-slate-400">Assigned Freight Vehicle:</span>
            <span className="font-mono font-bold text-amber-400">DL01AB1234 (Tata Prima 4028.S 18T)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-white/[0.04]">
            <span className="text-slate-400">Safety & Defensive Driving Score:</span>
            <span className="font-mono font-bold text-emerald-400">98 / 100 (Top 2% Fleet Pilot)</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-slate-400">Today&apos;s Hours of Service (HOS):</span>
            <span className="font-mono font-bold text-cyan-300">5.5 hrs used (3.5 hrs remaining)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>SIGN OUT OF DRIVER TERMINAL</span>
        </button>
      </div>
    </div>
  );
}
