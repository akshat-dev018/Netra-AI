'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { corridorsApi } from '@/lib/api';
import Link from 'next/link';
import {
  Route,
  Activity,
  MapPin,
  Clock,
  Gauge,
  CloudRain,
  Car,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';

const SAMPLE_CORRIDORS = [
  {
    id: 'c1',
    code: 'NH-44',
    name: 'Delhi – Mumbai Arterial Corridor',
    length: '1,428 km',
    avgSpeed: '58 km/h',
    activeTrucks: 412,
    utilization: 72,
    riskScore: 54,
    nodeStart: 'Delhi ICD',
    nodeEnd: 'JNPT Mumbai',
    segments: [
      { name: 'Delhi – Jaipur (NH-48)', km: '280 km', speed: '48 km/h', status: 'slow', waitTime: '18m toll' },
      { name: 'Jaipur – Ahmedabad', km: '660 km', speed: '38 km/h', status: 'bottleneck', waitTime: '45m delay' },
      { name: 'Ahmedabad – Mumbai JNPT', km: '488 km', speed: '68 km/h', status: 'optimal', waitTime: '8m toll' },
    ],
    riskBreakdown: { weather: 22, congestion: 38, incidents: 25, accidents: 15 },
    bottleneck: {
      location: 'Jaipur–Kishangarh Expressway KM 142',
      cause: 'Monsoon Waterlogging + 1 Lane Closed',
      delayEst: '+2.5h delay',
      detour: 'Via NH-52 Jaipur–Indore bypass (+32 km, saves 1h 20m)',
      patrolUnits: 'Ambulance DL-04 & NHAI Patrol Unit 12 on standby',
    },
  },
  {
    id: 'c2',
    code: 'NH-48',
    name: 'Delhi – Chennai Golden Arc',
    length: '2,807 km',
    avgSpeed: '64 km/h',
    activeTrucks: 328,
    utilization: 64,
    riskScore: 42,
    nodeStart: 'Delhi Tughlakabad',
    nodeEnd: 'Chennai Port',
    segments: [
      { name: 'Delhi – Agra', km: '240 km', speed: '72 km/h', status: 'optimal', waitTime: '5m toll' },
      { name: 'Agra – Nagpur', km: '810 km', speed: '62 km/h', status: 'optimal', waitTime: '12m toll' },
      { name: 'Nagpur – Hyderabad', km: '500 km', speed: '58 km/h', status: 'slow', waitTime: '15m toll' },
      { name: 'Hyderabad – Chennai', km: '628 km', speed: '66 km/h', status: 'optimal', waitTime: '8m toll' },
    ],
    riskBreakdown: { weather: 10, congestion: 18, incidents: 12, accidents: 14 },
    bottleneck: {
      location: 'Hyderabad Outer Ring Road Exit 9',
      cause: 'Heavy Multi-Axle Queue at Toll Plaza',
      delayEst: '+45m delay',
      detour: 'Via SH-1 Regional Expressway (saves 30m)',
      patrolUnits: 'Highway Patrol Unit 8 stationed',
    },
  },
  {
    id: 'c3',
    code: 'NH-19',
    name: 'Delhi – Kolkata Grand Trunk',
    length: '1,453 km',
    avgSpeed: '70 km/h',
    activeTrucks: 290,
    utilization: 58,
    riskScore: 32,
    nodeStart: 'Delhi Dadri',
    nodeEnd: 'Kolkata Port',
    segments: [
      { name: 'Delhi – Kanpur', km: '490 km', speed: '74 km/h', status: 'optimal', waitTime: '6m toll' },
      { name: 'Kanpur – Varanasi', km: '330 km', speed: '68 km/h', status: 'optimal', waitTime: '8m toll' },
      { name: 'Varanasi – Kolkata', km: '633 km', speed: '72 km/h', status: 'optimal', waitTime: '7m toll' },
    ],
    riskBreakdown: { weather: 8, congestion: 12, incidents: 6, accidents: 8 },
    bottleneck: {
      location: 'Varanasi Bypass KM 312',
      cause: 'Bridge Maintenance Single-Lane',
      delayEst: '+30m delay',
      detour: 'Via Ring Road East (saves 20m)',
      patrolUnits: 'Trauma Care Ambulances 02 stationed at Varanasi Base',
    },
  },
];

export default function CorridorsPage() {
  const [selectedCorridorCode, setSelectedCorridorCode] = useState('NH-44');

  const { data: dbCorridors } = useQuery({
    queryKey: ['corridors-list'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  const active =
    SAMPLE_CORRIDORS.find((c) => c.code === selectedCorridorCode) || SAMPLE_CORRIDORS[0];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Corridor Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold uppercase">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Throughput capacity, segment speed profiles, and bottleneck mitigation on major freight arteries.
          </p>
        </div>

        <Link
          href="/network"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Interactive Radar Map</span>
        </Link>
      </div>

      {/* Corridor Selector Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SAMPLE_CORRIDORS.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCorridorCode(c.code)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2.5 shrink-0 ${
              selectedCorridorCode === c.code
                ? 'bg-cyan-500/20 text-white border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'glass-card text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="font-mono font-bold text-cyan-400">{c.code}</span>
            <span className="text-slate-300">{c.name.split('–')[1] || c.name}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                c.riskScore > 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Risk: {c.riskScore}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Left 65% Telemetry + Segments, Right 35% Glass Panel Bottleneck Mitigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Corridor Status & Segments (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Corridor Length
              </span>
              <div className="text-xl font-bold font-mono text-white">{active.length}</div>
              <span className="text-[10px] text-slate-500">{active.nodeStart} → {active.nodeEnd}</span>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Fleet Average Speed
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400">{active.avgSpeed}</div>
              <span className="text-[10px] text-slate-500">Real-time telematics</span>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active En-Route Trucks
              </span>
              <div className="text-xl font-bold font-mono text-white">{active.activeTrucks}</div>
              <span className="text-[10px] text-emerald-400">98% GPS active</span>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Capacity Utilization
              </span>
              <div className="text-xl font-bold font-mono text-amber-400">{active.utilization}%</div>
              <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${active.utilization}%` }} />
              </div>
            </div>
          </div>

          {/* Segment Speed Breakdown Timeline */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Corridor Segments & Speed Profile
                </h2>
                <p className="text-[11px] text-slate-400">
                  Sub-arterial breakdown between major gateways and dry ports
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">{active.segments.length} Segments Monitored</span>
            </div>

            <div className="space-y-3.5">
              {active.segments.map((seg, idx) => {
                const isBottleneck = seg.status === 'bottleneck';
                const isSlow = seg.status === 'slow';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isBottleneck
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : isSlow
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-white text-xs">{seg.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({seg.km})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-white font-semibold">{seg.speed}</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isBottleneck
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isSlow
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {seg.status}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                          {seg.waitTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Glass Panel: Segment Risk Breakdown & Mitigation (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Risk Decomposition
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">{active.code} DYNAMIC FACTORS</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-400">{active.riskScore}/100</span>
            </div>

            {/* 4-Component Visual Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-cyan-400" /> Weather Factor
                  </span>
                  <span className="font-mono text-cyan-400">{active.riskBreakdown.weather}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${active.riskBreakdown.weather}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3 text-amber-400" /> Congestion Factor
                  </span>
                  <span className="font-mono text-amber-400">{active.riskBreakdown.congestion}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${active.riskBreakdown.congestion}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-400" /> Active Incidents
                  </span>
                  <span className="font-mono text-orange-400">{active.riskBreakdown.incidents}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${active.riskBreakdown.incidents}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" /> Historical Accident Density
                  </span>
                  <span className="font-mono text-rose-400">{active.riskBreakdown.accidents}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${active.riskBreakdown.accidents}%` }} />
                </div>
              </div>
            </div>

            {/* Active Bottleneck Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-semibold">
                  ACTIVE BOTTLENECK
                </span>
                <span className="font-mono text-rose-400 font-bold">{active.bottleneck.delayEst}</span>
              </div>
              <div className="font-semibold text-white text-xs">{active.bottleneck.location}</div>
              <p className="text-[11px] text-slate-400">{active.bottleneck.cause}</p>

              <div className="pt-2 border-t border-white/[0.04] space-y-1">
                <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Recommended Detour:
                </span>
                <p className="text-[11px] text-slate-300 leading-snug">{active.bottleneck.detour}</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/routes/optimizer"
                  className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Execute Dynamic Reroute</span>
                </Link>
              </div>
            </div>

            {/* Emergency & Patrol Standby */}
            <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs space-y-1">
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Trauma Hubs & Patrol Status
              </span>
              <p className="text-[11px] text-slate-300">{active.bottleneck.patrolUnits}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
