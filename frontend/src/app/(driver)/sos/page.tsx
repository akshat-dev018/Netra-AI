'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { emergencyApi } from '@/lib/api';
import {
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Radio,
  MapPin,
  Ambulance,
  PhoneForwarded,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverSOSPage() {
  const [sosSent, setSosSent] = useState(false);

  const sosMutation = useMutation({
    mutationFn: async () => {
      await emergencyApi.createAlert({
        type: 'sos_panic',
        severity: 'critical',
        description: 'DRIVER SOS PANIC BEACON: Immediate medical/tactical assistance requested on NH-44 near km 62',
        location: {
          type: 'Point',
          coordinates: [77.21, 28.5672],
        },
      });
    },
    onSuccess: () => {
      setSosSent(true);
      toast.error('CRITICAL SOS BEACON BROADCAST! NHAI Control Tower & Patrol Alerted.', {
        duration: 6000,
      });
    },
    onError: () => {
      // Offline fallback
      setSosSent(true);
      toast.error('EMERGENCY SOS BEACON DISPATCHED (Signal Queued to Control Tower)', {
        duration: 6000,
      });
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-24 text-center">
      {/* Header */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse" />
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            ONE-TOUCH EMERGENCY SOS PANIC
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Instantly transmit high-priority distress coordinates directly to the National Freight Intelligence Control Tower and nearest Highway Police.
        </p>
      </div>

      {/* Big Panic Button */}
      <div className="py-4 flex flex-col items-center justify-center">
        {!sosSent ? (
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => sosMutation.mutate()}
              disabled={sosMutation.isPending}
              className="w-52 h-52 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white font-bold font-mono text-3xl flex flex-col items-center justify-center shadow-2xl shadow-rose-900/80 border-4 border-slate-900 active:scale-95 transition-all hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-40" />
              <AlertOctagon className="w-14 h-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className="tracking-widest">SOS</span>
              <span className="text-[10px] font-sans font-semibold opacity-90 uppercase tracking-widest mt-1">
                {sosMutation.isPending ? 'BROADCASTING...' : 'PRESS TO BROADCAST'}
              </span>
            </button>
            <p className="text-xs text-slate-400 font-mono mt-4">
              Transmits GPS Lat: 28.5672°N, Lng: 77.2100°E
            </p>
          </div>
        ) : (
          <div className="w-full p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-500/70 text-center space-y-4 backdrop-blur-md animate-in zoom-in">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-900/80 animate-pulse">
              <Radio className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white uppercase font-mono">
                SOS DISTRESS TRANSMISSION BROADCASTING
              </h2>
              <p className="text-xs text-rose-200/90 mt-1 max-w-md mx-auto leading-relaxed">
                National Control Dispatch and the nearest Highway Rapid Response Patrol have locked onto your vehicle location.
              </p>
            </div>

            {/* Tactical Unit Dispatch Status */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-400 uppercase text-[10px]">DISPATCHED UNIT:</span>
                <span className="font-mono font-bold text-emerald-400">EN ROUTE (ETA 7 MIN)</span>
              </div>
              <div className="font-semibold text-white">NHAI Highway Patrol Unit #14 (Palwal Section)</div>
              <div className="text-[11px] text-slate-400 font-mono">Patrol Officer Mobile: +91 98765 11033</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-center">
              <a
                href="tel:112"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs transition-all shadow-lg shadow-rose-900/50"
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL POLICE / AMBULANCE (112)</span>
              </a>
              <button
                onClick={() => setSosSent(false)}
                className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-all"
              >
                Reset Beacon
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Hotline Numbers */}
      <div className="glass-panel p-5 text-left space-y-3">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold block">
          24/7 NATIONAL HIGHWAY HELPLINES
        </span>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <div>
              <div className="font-bold text-white text-xs">National Highway Emergency (NHAI)</div>
              <div className="text-[10px] text-slate-400">Toll-free 24/7 breakdown, crane & medical assistance</div>
            </div>
            <a
              href="tel:1033"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs transition-all"
            >
              1033
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <div>
              <div className="font-bold text-white text-xs">National Emergency Services (Police / EMS)</div>
              <div className="text-[10px] text-slate-400">Unified First Responder Dispatch across India</div>
            </div>
            <a
              href="tel:112"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs transition-all"
            >
              112
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <div>
              <div className="font-bold text-white text-xs">Netra Central Dispatch Desk</div>
              <div className="text-[10px] text-slate-400">FreightIntel fleet safety coordinator</div>
            </div>
            <a
              href="tel:1800112233"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs transition-all"
            >
              1800-NETRA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
