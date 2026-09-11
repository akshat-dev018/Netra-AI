'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shipmentsApi } from '@/lib/api';
import Link from 'next/link';
import {
  Navigation,
  MapPin,
  Clock,
  Package,
  Radio,
  AlertOctagon,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverTripPage() {
  const [checklist, setChecklist] = useState({
    cargoInspection: true,
    tireTreadChecked: true,
    fastagRecharged: true,
    eWayBillVerified: true,
  });

  const { data: shipments } = useQuery({
    queryKey: ['driver-shipment'],
    queryFn: async () => {
      const res = await shipmentsApi.list();
      return res.data.data;
    },
  });

  const activeTrip = shipments?.[0] || {
    reference: 'SHP-DEL-AGR-0941',
    origin: 'Tughlakabad ICD Container Depot, Delhi',
    destination: 'Agra Inland Container Freight Hub, UP',
    status: 'in_transit',
    cargoType: 'ISO 40ft High-Cube (Industrial Machine Components)',
    eta: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Pre-trip inspection checkpoint logged');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24">
      {/* Top Mission Status Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900/80 border border-cyan-500/30 shadow-xl flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">ACTIVE MISSION</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] text-cyan-300 font-mono">{activeTrip.reference}</div>
          </div>
        </div>

        <Link
          href="/location"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold hover:bg-emerald-500/25 transition-all shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>GPS Live</span>
        </Link>
      </div>

      {/* Transit Timeline Glass Card */}
      <div className="glass-panel p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            TRANSIT ROUTE ARTERY
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
            NH-44 NORTH
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-4 relative pl-1">
          {/* Step 1: Origin */}
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-4 h-4 rounded-full bg-cyan-400 mt-0.5 shrink-0 ring-4 ring-cyan-950 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                ORIGIN DISPATCH GATE
              </span>
              <span className="text-sm font-bold text-white">{activeTrip.origin}</span>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">Departed: 08:30 IST • Gate Pass Signed</span>
            </div>
          </div>

          {/* Vertical Connecting Line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-emerald-400 z-0" />

          {/* Step 2: Destination */}
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-4 h-4 rounded-full bg-emerald-400 mt-0.5 shrink-0 ring-4 ring-emerald-950 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                DESTINATION TERMINAL
              </span>
              <span className="text-sm font-bold text-white">{activeTrip.destination}</span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium block mt-0.5">
                Target ETA: {new Date(activeTrip.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (On Schedule)
              </span>
            </div>
          </div>
        </div>

        {/* Manifest Specs */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/[0.08] text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono block">CARGO SPECIFICATION</span>
            <span className="font-semibold text-slate-200 block truncate mt-0.5">{activeTrip.cargoType}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono block">ESTIMATED REMAINING</span>
            <span className="font-semibold font-mono text-cyan-400 block mt-0.5">142 km (~3h 15m)</span>
          </div>
        </div>
      </div>

      {/* Corridor Advisory Alert */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <div className="font-bold text-amber-300 font-mono uppercase">CORRIDOR RISK ADVISORY: PALWAL-HODAL</div>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            Moderate road bottleneck reported at km 84 due to heavy freight lane merging. Maintain 40 km/h cruising limit.
          </p>
        </div>
      </div>

      {/* Pre-Trip Inspection Checklist */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              MANDATORY PILOT CHECKLIST
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">4 / 4 COMPLIANT</span>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => toggleCheck('cargoInspection')}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-left hover:border-slate-700 transition-colors"
          >
            <span className="text-slate-200">Seal intact & ISO container lock engaged</span>
            <CheckCircle2
              className={`w-4 h-4 ${checklist.cargoInspection ? 'text-emerald-400' : 'text-slate-600'}`}
            />
          </button>

          <button
            onClick={() => toggleCheck('tireTreadChecked')}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-left hover:border-slate-700 transition-colors"
          >
            <span className="text-slate-200">10-wheel tire pressure & braking fluid verified</span>
            <CheckCircle2
              className={`w-4 h-4 ${checklist.tireTreadChecked ? 'text-emerald-400' : 'text-slate-600'}`}
            />
          </button>

          <button
            onClick={() => toggleCheck('fastagRecharged')}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-left hover:border-slate-700 transition-colors"
          >
            <span className="text-slate-200">FASTag wallet balance positive (&gt; ₹2,500)</span>
            <CheckCircle2
              className={`w-4 h-4 ${checklist.fastagRecharged ? 'text-emerald-400' : 'text-slate-600'}`}
            />
          </button>

          <button
            onClick={() => toggleCheck('eWayBillVerified')}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-left hover:border-slate-700 transition-colors"
          >
            <span className="text-slate-200">National GST E-Way Bill active on mobile terminal</span>
            <CheckCircle2
              className={`w-4 h-4 ${checklist.eWayBillVerified ? 'text-emerald-400' : 'text-slate-600'}`}
            />
          </button>
        </div>
      </div>

      {/* Instant Emergency SOS Panic Banner */}
      <Link
        href="/sos"
        className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-red-950/60 to-rose-950/70 border border-rose-500/50 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950/80">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white font-mono">EMERGENCY SOS PANIC</div>
            <div className="text-[11px] text-rose-300">Tap to broadcast instant distress coordinates to NHAI & Police</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
