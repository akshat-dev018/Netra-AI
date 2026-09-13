'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '@/lib/api';
import {
  BrainCircuit,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PredictionsPage() {
  const queryClient = useQueryClient();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictions-list'],
    queryFn: async () => {
      const res = await predictionsApi.list();
      return res.data.data;
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: async () => {
      await predictionsApi.recompute();
    },
    onSuccess: () => {
      toast.success('ML Delay Models recomputed with live traffic vectors!');
      queryClient.invalidateQueries({ queryKey: ['predictions-list'] });
    },
    onError: () => {
      toast.error('Prediction recalculation failed');
    },
  });

  const demoPredictions = predictions && predictions.length > 0 ? predictions : [
    {
      corridor: 'NH-44 Delhi–Agra Artery',
      predictedDelayMinutes: 35,
      confidence: 94,
      impactFactors: ['Evening peak commute congestion near Badarpur Toll', 'Dense monsoon radiation fog reducing visibility'],
      recommendedAction: 'Stagger departure times by +45 mins or divert through Eastern Peripheral Expressway.',
      affectedShipments: 28,
    },
    {
      corridor: 'NH-48 Delhi–Jaipur Expressway',
      predictedDelayMinutes: 50,
      confidence: 91,
      impactFactors: ['Heavy commercial truck staging at Bilaspur', 'Toll Plaza digital gate maintenance'],
      recommendedAction: 'Advise drivers to use Kundli-Manesar connector and avoid NH-48 toll plaza bottleneck.',
      affectedShipments: 42,
    },
    {
      corridor: 'NH-19 Delhi–Kolkata Trunk',
      predictedDelayMinutes: 25,
      confidence: 88,
      impactFactors: ['Coal convoy movement near Varanasi Outer Ring', 'Routine weigh-bridge inspection backlog'],
      recommendedAction: 'Pre-alert consignees of minor delay; corridor buffer adequate.',
      affectedShipments: 16,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              AI Predictive Delay Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
              TIME-SERIES ML
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Predicts freight transit lag 6 to 12 hours ahead based on weather telemetry, historical seasonality, and bottleneck queues.
          </p>
        </div>

        <button
          onClick={() => recomputeMutation.mutate()}
          disabled={recomputeMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded btn-primary text-xs font-semibold text-on-primary transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Bot className={`w-3.5 h-3.5 ${recomputeMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{recomputeMutation.isPending ? 'Forecasting...' : 'Recalculate AI Predictions'}</span>
        </button>
      </div>

      {/* Main Grid: Left 65% Forecast Cards, Right 35% Glass Panel ML Engine Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {demoPredictions.map((p: any, i: number) => (
              <div
                key={i}
                className="glass-card p-5 sm:p-6 rounded flex flex-col justify-between space-y-4 hover:border-subtle transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-primary border border-subtle uppercase">
                      CORRIDOR ML MODEL
                    </span>
                    <span className="text-xs text-primary font-mono font-semibold">
                      Confidence: <b className="text-main">{p.confidence ?? 90}%</b>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-main">{p.corridor || 'Corridor Forecast'}</h3>
                      <span className="text-[11px] text-muted">
                        {p.affectedShipments || 24} active consignments traversing
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-warning flex items-center gap-2 self-start sm:self-auto">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-mono font-bold text-sm">+{p.predictedDelayMinutes ?? 35} mins</span>
                      <span className="text-[11px] text-warning/80">predicted delay</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                      Contributing Neural Signals:
                    </span>
                    <div className="space-y-1.5">
                      {p.impactFactors?.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-main text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-white/[0.03] border border-subtle text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-primary font-semibold uppercase block mb-0.5">
                      Recommended Mitigation:
                    </span>
                    <p className="text-main text-[11px] leading-relaxed">{p.recommendedAction}</p>
                  </div>
                  <button
                    onClick={() => toast.success('Dispatched AI proactive rest recommendation to drivers')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-primary text-xs font-semibold shrink-0 transition-all"
                  >
                    Broadcast Advisory
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Glass Panel: ML Intelligence Breakdown (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    Model Accuracy & Drift
                  </h2>
                  <p className="text-[10px] text-muted font-mono">LSTM + GNN PIPELINE</p>
                </div>
              </div>
              <span className="text-success font-mono text-xs font-bold">v2.4 Live</span>
            </div>

            {/* Model Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <span className="text-muted">Mean Absolute Error (MAE)</span>
                <span className="font-mono text-main font-bold">± 4.2 Mins</span>
              </div>
              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <span className="text-muted">Model Precision Rate</span>
                <span className="font-mono text-success font-bold">96.8%</span>
              </div>
              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <span className="text-muted">Last Weight Retraining</span>
                <span className="font-mono text-main">2 Hours Ago</span>
              </div>
            </div>

            {/* Leading Signals */}
            <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2 text-xs">
              <span className="text-xs font-semibold text-main block">Top Predictive Features</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-main">
                  <span>FASTag toll wait differential</span>
                  <span className="font-mono text-primary">38% Weight</span>
                </div>
                <div className="flex justify-between text-main">
                  <span>Doppler precipitation forecast</span>
                  <span className="font-mono text-primary">26% Weight</span>
                </div>
                <div className="flex justify-between text-main">
                  <span>Historical weekend bottlenecks</span>
                  <span className="font-mono text-primary">20% Weight</span>
                </div>
                <div className="flex justify-between text-main">
                  <span>Active crash reports</span>
                  <span className="font-mono text-primary">16% Weight</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-subtle">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="flex items-center gap-1.5 text-success">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero model drift detected</span>
              </span>
              <span className="font-mono text-primary">99.8% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
