'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskApi } from '@/lib/api';
import {
  ShieldAlert,
  Flame,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Car,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RiskPage() {
  const queryClient = useQueryClient();

  const { data: corridorsRisk, isLoading } = useQuery({
    queryKey: ['risk-corridors'],
    queryFn: async () => {
      const res = await riskApi.getCorridors();
      return res.data.data;
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: async () => {
      await riskApi.recompute();
    },
    onSuccess: () => {
      toast.success('Neural Risk Engine recomputed corridor hazard ratings!');
      queryClient.invalidateQueries({ queryKey: ['risk-corridors'] });
    },
    onError: () => {
      toast.error('Risk recomputation failed');
    },
  });

  const defaultCorridors = [
    {
      _id: 'r1',
      highwayRef: 'NH-44',
      name: 'Delhi – Mumbai Arterial Corridor',
      nodeStart: 'Delhi ICD',
      nodeEnd: 'JNPT Mumbai',
      currentUtilization: 72,
      riskScore: 54,
      riskComponents: { congestion: 24, weather: 14, incidents: 10, accidentDensity: 6 },
    },
    {
      _id: 'r2',
      highwayRef: 'NH-48',
      name: 'Delhi – Chennai Golden Arc',
      nodeStart: 'Delhi Tughlakabad',
      nodeEnd: 'Chennai Port',
      currentUtilization: 64,
      riskScore: 68,
      riskComponents: { congestion: 32, weather: 22, incidents: 8, accidentDensity: 6 },
    },
    {
      _id: 'r3',
      highwayRef: 'NH-19',
      name: 'Delhi – Kolkata Grand Trunk',
      nodeStart: 'Delhi Dadri',
      nodeEnd: 'Kolkata Port',
      currentUtilization: 58,
      riskScore: 32,
      riskComponents: { congestion: 14, weather: 6, incidents: 8, accidentDensity: 4 },
    },
    {
      _id: 'r4',
      highwayRef: 'NH-27',
      name: 'Porbandar – Silchar East-West',
      nodeStart: 'Porbandar Port',
      nodeEnd: 'Silchar Hub',
      currentUtilization: 46,
      riskScore: 28,
      riskComponents: { congestion: 10, weather: 8, incidents: 6, accidentDensity: 4 },
    },
  ];

  const displayCorridors = corridorsRisk && corridorsRisk.length > 0 ? corridorsRisk : defaultCorridors;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              National Corridor Risk Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-warning font-mono text-[10px] font-semibold uppercase">
              AI RISK MATRIX
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time composite scoring aggregating road geometry, weather sensors, historical accident clusters, and live congestion.
          </p>
        </div>

        <button
          onClick={() => recomputeMutation.mutate()}
          disabled={recomputeMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded btn-warning text-xs font-semibold text-white transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recomputeMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{recomputeMutation.isPending ? 'Recomputing AI Matrix...' : 'Trigger Full Recomputation'}</span>
        </button>
      </div>

      {/* Main Grid: Left 65% Corridor Cards, Right 35% Glass Panel National Risk Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayCorridors.map((c: any) => {
              const score = c.riskScore ?? 38;
              const isElevated = score > 60;
              const isModerate = score > 35;

              return (
                <div
                  key={c._id || c.name}
                  className={`p-5 rounded border transition-all flex flex-col justify-between space-y-4 ${
                    isElevated
                      ? 'glass-panel-elevated border-rose-500/40 hover:border-rose-500/60'
                      : isModerate
                      ? 'glass-card border-amber-500/30 hover:border-amber-500/50'
                      : 'glass-card hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-primary">
                        {c.highwayRef || 'CORRIDOR'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          isElevated ? 'text-critical' : isModerate ? 'text-warning' : 'text-success'
                        }`}
                      >
                        {score}/100
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-main">{c.name}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {c.nodeStart || 'Delhi'} → {c.nodeEnd || 'Agra'} ({c.currentUtilization || 42}% utilization)
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-primary-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score > 60 ? 'bg-rose-500' : score > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-muted block text-[10px]">Congestion</span>
                        <span className="font-mono font-semibold text-warning">
                          {c.riskComponents?.congestion ?? 12}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-muted block text-[10px]">Weather</span>
                        <span className="font-mono font-semibold text-success">
                          {c.riskComponents?.weather ?? 8}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-muted block text-[10px]">Incidents</span>
                        <span className="font-mono font-semibold text-orange-400">
                          {c.riskComponents?.incidents ?? 8}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-muted block text-[10px]">Accident Hotspots</span>
                        <span className="font-mono font-semibold text-critical">
                          {c.riskComponents?.accidentDensity ?? 10}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Glass Panel: National Aggregate Risk (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-warning-50 border border-amber-500/30 flex items-center justify-center text-warning">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    National Risk Summary
                  </h2>
                  <p className="text-[10px] text-muted font-mono">AGGREGATE INDEX</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-warning-50 text-warning text-[10px] font-mono font-bold">
                MODERATE
              </span>
            </div>

            <div className="p-4 rounded bg-white/[0.02] border border-subtle text-center space-y-1">
              <span className="text-[10px] text-muted uppercase tracking-wider block">
                Weighted National Index
              </span>
              <div className="text-4xl font-bold font-mono text-warning">48 / 100</div>
              <p className="text-[11px] text-muted mt-1">
                Monitored across 14 freight arteries covering 18,400+ kilometers.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                Primary Volatility Triggers:
              </span>
              <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-critical text-xs">1. Monsoon Flash Flood (NH-48)</div>
                <p className="text-[11px] text-main">Contributes +18 pts to Northern grid risk index.</p>
              </div>
              <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-warning text-xs">2. Toll Plaza Gantry Delays</div>
                <p className="text-[11px] text-main">Affecting Panipat & Gurugram interchanges.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Model: Neural Risk Engine v2</span>
            <span className="text-success font-mono">Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
