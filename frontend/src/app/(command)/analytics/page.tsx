'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getOverview();
      return res.data.data;
    },
  });

  const { data: compliance } = useQuery({
    queryKey: ['analytics-compliance'],
    queryFn: async () => {
      const res = await analyticsApi.getFleetCompliance();
      return res.data.data;
    },
  });

  const volumeData = [
    { day: 'Mon', shipments: 42, onTime: 39, delayed: 3 },
    { day: 'Tue', shipments: 58, onTime: 52, delayed: 6 },
    { day: 'Wed', shipments: 65, onTime: 58, delayed: 7 },
    { day: 'Thu', shipments: 74, onTime: 68, delayed: 6 },
    { day: 'Fri', shipments: 88, onTime: 79, delayed: 9 },
    { day: 'Sat', shipments: 52, onTime: 49, delayed: 3 },
    { day: 'Sun', shipments: 34, onTime: 33, delayed: 1 },
  ];

  const corridorData = [
    { name: 'NH-44', volume: 840, capacity: 1000 },
    { name: 'NH-48', volume: 620, capacity: 800 },
    { name: 'E-Way', volume: 480, capacity: 900 },
    { name: 'NH-19', volume: 550, capacity: 700 },
  ];

  const riskDistribution = [
    { name: 'Congestion', value: 38, color: '#F59E0B' },
    { name: 'Weather Hazards', value: 24, color: '#06B6D4' },
    { name: 'Accidents Hotspots', value: 22, color: '#F43F5E' },
    { name: 'Road Closures', value: 16, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Network Analytics & BI
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold uppercase">
              BI CONTROL SUITE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Macro logistics efficiency metrics, corridor throughput benchmarks, and emergency response performance.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">On-Time Reliability</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">94.2%</div>
          <div className="text-[11px] text-emerald-400">+1.8% vs benchmark</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Avg Transit Duration</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">3h 48m</div>
          <div className="text-[11px] text-cyan-400">Nominal corridor transit</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Response Dispatch</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">8.4 mins</div>
          <div className="text-[11px] text-emerald-400">Target &lt; 12 mins</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Fleet Safety Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {compliance?.score ?? 96}/100
          </div>
          <div className="text-[11px] text-slate-400">Zero critical infractions</div>
        </div>
      </div>

      {/* Main Charts: 8 cols left, 4 cols glass panel right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          {/* Chart 1: Weekly Volume & Reliability */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Weekly Dispatch Manifests & Reliability
                </h3>
                <p className="text-[11px] text-slate-400">On-time delivery performance vs delayed loads</p>
              </div>
              <span className="text-xs text-cyan-400 font-mono">413 Total Shipments</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDelayed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 15, 29, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="onTime"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOnTime)"
                    name="On-Time Manifest"
                  />
                  <Area
                    type="monotone"
                    dataKey="delayed"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDelayed)"
                    name="Delayed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Corridor Throughput vs Limit */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Corridor Traffic Volume vs Capacity Limit
                </h3>
                <p className="text-[11px] text-slate-400">Daily commercial freight TEU count</p>
              </div>
              <span className="text-xs text-cyan-400 font-mono">Daily TEU Load</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={corridorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 15, 29, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="volume" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Active Volume" />
                  <Bar dataKey="capacity" fill="#1E293B" radius={[6, 6, 0, 0]} name="Design Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Glass Panel: Risk Decomposition & Synthesis (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Risk Synthesis
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">WEIGHTED DECOMPOSITION</p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">100% Total</span>
            </div>

            {/* Donut Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={6}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 15, 29, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 text-xs">
              {riskDistribution.map((r) => (
                <div
                  key={r.name}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-slate-300 text-[11px] font-medium">{r.name}</span>
                  </div>
                  <span className="font-mono text-white font-bold text-xs">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>Model Refresh</span>
            <span className="text-emerald-400 font-mono">Auto-sync 15s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
