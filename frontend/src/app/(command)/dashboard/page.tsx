'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  analyticsApi,
  riskApi,
  emergencyApi,
  shipmentsApi,
  corridorsApi,
  disruptionsApi,
  predictionsApi,
} from '@/lib/api';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Package,
  AlertTriangle,
  Flame,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  Sliders,
  FileDown,
  Bot,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MiniRiskMap = dynamic(
  () => import('@/components/dashboard/MiniRiskMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] rounded bg-card border border-subtle flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-mono text-primary">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>INITIALIZING RADAR TELEMETRY...</span>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getOverview();
      return res.data.data;
    },
    refetchInterval: 15_000,
  });

  const { data: disruptions } = useQuery({
    queryKey: ['disruptions-recent'],
    queryFn: async () => {
      const res = await disruptionsApi.list({ limit: 4 });
      return res.data.data;
    },
    refetchInterval: 20_000,
  });

  const { data: corridors } = useQuery({
    queryKey: ['corridors-recent'],
    queryFn: async () => {
      const res = await corridorsApi.list({ limit: 6 });
      return res.data.data;
    },
  });

  const { data: predictions } = useQuery({
    queryKey: ['predictions-recent'],
    queryFn: async () => {
      const res = await predictionsApi.list();
      return res.data.data;
    },
  });

  const recomputeRisk = useMutation({
    mutationFn: async () => {
      await riskApi.recompute();
    },
    onSuccess: () => {
      toast.success('AI Network Risk recalculated');
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
  });

  // Fallback realistic prototype data when seed is initializing
  const activeShipments = overview?.activeShipments ?? 142;
  const shipmentsAtRisk = overview?.shipmentsAtRisk ?? 19;
  const openDisruptions = overview?.openDisruptions ?? 7;
  const riskIndex = overview?.networkRiskIndex ?? 48;
  const accuracy = '94.2%';

  const kpis = [
    {
      label: 'ACTIVE SHIPMENTS',
      val: activeShipments,
      sub: '+8% vs yesterday',
      trend: 'up',
      icon: Package,
      href: '/shipments',
    },
    {
      label: 'AT-RISK SHIPMENTS',
      val: shipmentsAtRisk,
      sub: '3 critical delays',
      badgeColor: 'text-warning',
      icon: AlertTriangle,
      href: '/risk',
    },
    {
      label: 'ACTIVE DISRUPTIONS',
      val: openDisruptions,
      sub: '2 major closures',
      badgeColor: 'text-critical',
      icon: Flame,
      href: '/disruptions',
    },
    {
      label: 'NETWORK RISK INDEX',
      val: riskIndex,
      unit: '/ 100',
      sub: riskIndex > 50 ? 'HIGH RISK' : 'MODERATE',
      subColor: riskIndex > 50 ? 'text-critical' : 'text-warning',
      icon: ShieldAlert,
      href: '/risk',
    },
    {
      label: 'AI PREDICTION ACCURACY',
      val: accuracy,
      sub: 'Based on last 500 trips',
      trend: 'up',
      icon: Activity,
      href: '/predictions',
    },
  ];

  // Disruption alerts sample list
  const alertItems =
    disruptions && disruptions.length > 0
      ? disruptions.slice(0, 3)
      : [
          {
            _id: '1',
            type: 'Flash Flood Warning',
            severity: 'critical',
            affectedHighway: 'NH-48 Jaipur - Ahmedabad',
            delay: '+4.5h delay est.',
            time: '12m ago',
          },
          {
            _id: '2',
            type: 'Multi-Vehicle Collision',
            severity: 'high',
            affectedHighway: 'NH-44 Panipat Toll KM 72',
            delay: '+2.1h delay est.',
            time: '34m ago',
          },
          {
            _id: '3',
            type: 'Toll System Outage',
            severity: 'medium',
            affectedHighway: 'NH-19 Varanasi Bypass',
            delay: '+45m delay est.',
            time: '1h ago',
          },
        ];

  // Predictions sample list
  const predictionItems =
    predictions && predictions.length > 0
      ? predictions.slice(0, 3)
      : [
          {
            shipmentRef: 'SHP-8821',
            route: 'Delhi → Mumbai',
            delay: '+3.2h',
            probability: 88,
            cause: 'Monsoon Front / Surat',
          },
          {
            shipmentRef: 'SHP-9043',
            route: 'Chennai → Bengaluru',
            delay: '+1.5h',
            probability: 74,
            cause: 'Sriperumbudur Congestion',
          },
          {
            shipmentRef: 'SHP-7712',
            route: 'Kolkata → Patna',
            delay: '+4.0h',
            probability: 91,
            cause: 'NH-19 Heavy Vehicle Convoy',
          },
        ];

  // Corridor Health items
  const corridorHealth = [
    {
      code: 'NH-44',
      name: 'Delhi - Mumbai Arterial',
      status: 'MODERATE RISK',
      speed: '58 km/h',
      incidents: '2 active',
      health: 64,
      color: 'bg-amber-500',
    },
    {
      code: 'NH-48',
      name: 'Delhi - Chennai Corridor',
      status: 'SEVERE HAZARD',
      speed: '34 km/h',
      incidents: '3 active',
      health: 38,
      color: 'bg-rose-500',
    },
    {
      code: 'NH-19',
      name: 'Delhi - Kolkata Freight Way',
      status: 'OPTIMAL',
      speed: '72 km/h',
      incidents: '0 active',
      health: 92,
      color: 'bg-emerald-500',
    },
    {
      code: 'NH-52',
      name: 'Jaipur - Indore Link',
      status: 'OPTIMAL',
      speed: '68 km/h',
      incidents: '1 minor',
      health: 84,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
            Good morning, Officer.
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Live overview of national freight corridors, active shipments, and real-time risk alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/simulator"
            className="flex items-center gap-2 px-3.5 py-2 rounded glass-card text-xs font-medium text-main hover:text-main hover:border-subtle transition-all shadow-sm group"
          >
            <Sliders className="w-3.5 h-3.5 text-primary group-hover:rotate-45 transition-transform" />
            <span>Run What-If Simulation</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-2 px-3.5 py-2 rounded btn-primary text-xs font-semibold text-on-primary transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Row of 5 FreightIntel KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="glass-card p-4 rounded relative group transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  {kpi.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-main">
                  {kpi.val}
                </span>
                {kpi.unit && (
                  <span className="text-xs text-muted font-mono">{kpi.unit}</span>
                )}
              </div>
              <div className="mt-1 flex items-center text-[11px]">
                <span
                  className={`font-medium ${
                    kpi.subColor || (kpi.trend === 'up' ? 'text-success' : 'text-muted')
                  }`}
                >
                  {kpi.sub}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mid Section: 3 Columns (Map, Disruption Alerts, Delay Predictions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Network Risk Map */}
        <div className="glass-card p-4 sm:p-5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-main tracking-tight">Network Risk Map</h2>
              <p className="text-[11px] text-muted">Live corridor telematics overlay</p>
            </div>
            <Link
              href="/network"
              className="text-xs text-primary hover:text-primary flex items-center gap-1 font-medium"
            >
              Full Map <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <MiniRiskMap corridors={corridors} alerts={disruptions} />
        </div>

        {/* Card 2: Real-Time Disruption Alerts */}
        <div className="glass-card p-4 sm:p-5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-main tracking-tight">
                Real-Time Disruption Alerts
              </h2>
              <p className="text-[11px] text-muted">Roadblocks, severe weather & hazards</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-critical text-[10px] font-mono font-semibold">
              {openDisruptions} Active
            </span>
          </div>

          <div className="space-y-2.5 flex-1 my-1">
            {alertItems.map((a: any) => {
              const isCrit = a.severity === 'critical';
              const isHigh = a.severity === 'high';
              return (
                <div
                  key={a._id}
                  className={`p-3 rounded border transition-all text-xs ${
                    isCrit
                      ? 'bg-rose-500/10 border-rose-500/25 hover:border-rose-500/40'
                      : isHigh
                      ? 'bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40'
                      : 'bg-white/[0.02] border-subtle hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isCrit
                          ? 'bg-critical-50 text-critical'
                          : isHigh
                          ? 'bg-warning-50 text-warning'
                          : 'bg-cyan-500/20 text-primary'
                      }`}
                    >
                      {a.severity || 'ALERT'}
                    </span>
                    <span className="text-[10px] text-muted font-mono">{a.time || 'recent'}</span>
                  </div>
                  <div className="font-semibold text-main text-xs truncate">
                    {a.type || a.description || 'Highway Disruption'}
                  </div>
                  <div className="text-[11px] text-muted flex items-center justify-between mt-1">
                    <span className="truncate">{a.affectedHighway || 'Golden Quadrilateral'}</span>
                    <span className="text-warning font-mono text-[10px] shrink-0">{a.delay || '+2h'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/disruptions"
            className="pt-2 text-center text-xs text-primary hover:text-primary font-medium flex items-center justify-center gap-1 border-t border-subtle"
          >
            <span>View all {openDisruptions} alerts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Shipment Delay Predictions (Next 24h) */}
        <div className="glass-card p-4 sm:p-5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-main tracking-tight">
                Delay Predictions (Next 24h)
              </h2>
              <p className="text-[11px] text-muted">AI ML-based delay probability</p>
            </div>
            <Link
              href="/predictions"
              className="text-xs text-primary hover:text-primary flex items-center gap-1 font-medium"
            >
              All Predictions <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 my-1">
            {predictionItems.map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded border border-subtle bg-white/[0.02] hover:border-white/[0.12] transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">
                    {p.shipmentRef || `SHP-00${idx + 1}`}
                  </span>
                  <span className="font-mono text-critical font-bold text-xs">{p.delay}</span>
                </div>
                <div className="text-[11px] text-main truncate">{p.route}</div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Delay Risk</span>
                    <span className="font-mono font-semibold text-main">{p.probability}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-primary-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.probability > 80
                          ? 'bg-rose-500'
                          : p.probability > 60
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${p.probability}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-muted truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted shrink-0" />
                  <span>Cause: {p.cause}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-muted border-t border-subtle">
            <span>Model Confidence</span>
            <span className="text-success font-mono font-semibold">96.8% Reliable</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 Columns: Left Corridor Health, Right AI Recommendation Engine (Glass Panel Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Corridor Health Status (8 cols) */}
        <div className="lg:col-span-8 glass-card p-5 rounded space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-main tracking-tight">
                Corridor Health Status
              </h2>
              <p className="text-[11px] text-muted">
                Live flow status, bottlenecks, and speed on key national arteries
              </p>
            </div>
            <Link
              href="/corridors"
              className="text-xs text-primary hover:text-primary flex items-center gap-1 font-medium"
            >
              Corridor Intel <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-subtle text-muted text-[11px]">
                  <th className="pb-3 font-medium">Corridor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Avg Speed</th>
                  <th className="pb-3 font-medium">Incidents</th>
                  <th className="pb-3 font-medium text-right">Health Meter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {corridorHealth.map((c) => (
                  <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3">
                      <div className="font-mono font-bold text-main text-xs">{c.code}</div>
                      <div className="text-[11px] text-muted">{c.name}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          c.status === 'OPTIMAL'
                            ? 'bg-success-50 text-success border border-emerald-500/30'
                            : c.status === 'MODERATE RISK'
                            ? 'bg-amber-500/15 text-warning border border-amber-500/30'
                            : 'bg-rose-500/15 text-critical border border-rose-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-main text-xs">{c.speed}</td>
                    <td className="py-3 text-muted text-[11px]">{c.incidents}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-20 h-1.5 rounded-full bg-primary-100 overflow-hidden">
                          <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.health}%` }} />
                        </div>
                        <span className="font-mono text-xs font-semibold text-main w-8 text-right">
                          {c.health}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Glass Panel: AI Recommendation Engine (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-main uppercase tracking-wider">
                  AI Recommendations
                </h3>
                <p className="text-[10px] text-primary/80 font-mono">AUTONOMOUS DISPATCH ENGINE</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3 flex-1">
            {/* Rec 1 */}
            <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2 hover:border-subtle transition-all">
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-warning-50 text-warning font-mono font-semibold">
                  HIGH IMPACT
                </span>
                <span className="text-success font-mono">94% Confidence</span>
              </div>
              <p className="text-xs text-main leading-snug">
                Reroute 14 NH-48 consignments via NH-52 to circumvent the Jaipur flash flood bottleneck.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted">Saves ~3.5h delay</span>
                <Link
                  href="/routes/optimizer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-subtle text-primary text-[11px] font-semibold transition-all"
                >
                  Apply Reroute
                </Link>
              </div>
            </div>

            {/* Rec 2 */}
            <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2 hover:border-subtle transition-all">
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-primary font-mono font-semibold">
                  PROACTIVE
                </span>
                <span className="text-success font-mono">89% Confidence</span>
              </div>
              <p className="text-xs text-main leading-snug">
                Dispatched early rest-stop suggestion to 8 drivers near Agra ahead of dense evening fog.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted">Accident risk reduced by 42%</span>
                <Link
                  href="/copilot"
                  className="text-primary hover:text-primary text-[11px] font-medium flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-subtle flex items-center justify-between">
            <Link
              href="/copilot"
              className="w-full py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] border border-subtle text-center text-xs font-semibold text-primary transition-all flex items-center justify-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>Ask NETRA Freight Copilot</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
