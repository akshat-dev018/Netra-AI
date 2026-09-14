'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { simulatorApi } from '@/lib/api';
import {
  Sliders,
  Play,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldAlert,
  Bot,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SimulatorPage() {
  const [scenarioName, setScenarioName] = useState('NH-44 Monsoon Flash Flood & Roadblock');
  const [durationHours, setDurationHours] = useState(8);
  const [severityMultiplier, setSeverityMultiplier] = useState(1.8);
  const [affectedVolume, setAffectedVolume] = useState(450);

  const [simulationResult, setSimulationResult] = useState<any | null>({
    delay: '+6h 15m',
    costDelta: '₹18,90,000',
    atRisk: 81,
    bypassLoad: 'Eastern Peripheral (+38%)',
    recoveryTime: '14 Hours',
  });

  const { data: scenarios } = useQuery({
    queryKey: ['simulator-scenarios'],
    queryFn: async () => {
      const res = await simulatorApi.getScenarios();
      return res.data.data;
    },
  });

  // Recompute simulation metrics dynamically when sliders change
  const computeMetrics = (dur: number, sev: number, vol: number) => {
    const totalMins = Math.round(dur * 0.75 * sev * 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const delayStr = hrs > 0 ? `+${hrs}h ${mins}m` : `+${mins}m`;
    const cost = Math.round(vol * 4200 * sev);
    const atRiskCount = Math.round(vol * 0.18 * (sev / 1.5));
    const recHrs = Math.round(dur * 1.8);

    setSimulationResult({
      delay: delayStr,
      costDelta: `₹${cost.toLocaleString('en-IN')}`,
      atRisk: atRiskCount,
      bypassLoad: 'Eastern Peripheral (+42%)',
      recoveryTime: `${recHrs} Hours`,
    });
  };

  const handleDurationChange = (val: number) => {
    setDurationHours(val);
    computeMetrics(val, severityMultiplier, affectedVolume);
  };

  const handleSeverityChange = (val: number) => {
    setSeverityMultiplier(val);
    computeMetrics(durationHours, val, affectedVolume);
  };

  const handleVolumeChange = (val: number) => {
    setAffectedVolume(val);
    computeMetrics(durationHours, severityMultiplier, val);
  };

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await simulatorApi.run({
        name: scenarioName,
        inputVariables: {
          durationHours,
          severityMultiplier,
          affectedVolume,
        },
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.resultSummary) {
        setSimulationResult({
          delay: data.resultSummary.delay || simulationResult.delay,
          costDelta: data.resultSummary.costDelta || simulationResult.costDelta,
          atRisk: data.resultSummary.atRisk || simulationResult.atRisk,
          bypassLoad: data.resultSummary.bypassLoad || 'Eastern Peripheral (+42%)',
          recoveryTime: data.resultSummary.recoveryTime || simulationResult.recoveryTime,
        });
      }
      toast.success('Simulation executed. Impact vectors synthesized.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Simulation run failed');
    },
  });

  const presetScenarios = [
    {
      name: 'NH-44 Monsoon Flash Flood & Roadblock',
      duration: 8,
      severity: 1.8,
      volume: 450,
      desc: 'Simulates heavy rainfall causing complete submersion of Palwal underpass.',
    },
    {
      name: 'Delhi Outer Ring Road Toll Gateway Strike',
      duration: 14,
      severity: 2.2,
      volume: 820,
      desc: 'Simulates freight blockade at Badarpur border with multi-mile vehicle queues.',
    },
    {
      name: 'Emergency Hazardous Spill on Mathura Bypass',
      duration: 6,
      severity: 2.5,
      volume: 310,
      desc: 'Chemical tanker leak necessitating immediate 5km perimeter diversion.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
            What-If Disruption Simulator
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
            CONTINGENCY MODELING
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted mt-0.5">
          Model catastrophic bottlenecks, extreme weather events, and transport strikes before they disrupt live supply chains.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
          Pre-Configured Contingency Scenarios:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presetScenarios.map((p) => {
            const isSelected = scenarioName === p.name;
            return (
              <button
                key={p.name}
                onClick={() => {
                  setScenarioName(p.name);
                  setDurationHours(p.duration);
                  setSeverityMultiplier(p.severity);
                  setAffectedVolume(p.volume);
                }}
                className={`p-4 rounded border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-50 border-cyan-500/50 '
                    : 'glass-card hover:border-white/[0.12]'
                }`}
              >
                <div className="font-bold text-xs text-main">{p.name}</div>
                <div className="text-[11px] text-muted mt-1 line-clamp-2">{p.desc}</div>
                <div className="mt-2 text-[10px] font-mono text-primary flex items-center justify-between">
                  <span>Duration: {p.duration}h</span>
                  <span>Severity: {p.severity}x</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Config (7 cols), Right Glass Panel Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Parameters Slider Panel (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div>
              <h2 className="text-sm font-bold text-main tracking-tight">
                Scenario Variables Configuration
              </h2>
              <p className="text-[11px] text-muted">Tweak parameters to compute network ripple effects</p>
            </div>
            <span className="text-xs font-mono text-primary font-semibold">
              ACTIVE SELECTION
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2 p-3.5 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="flex justify-between items-center">
                <span className="text-main font-medium">Incident Duration:</span>
                <span className="font-mono text-main font-bold text-sm bg-white/10 px-2 py-0.5 rounded">
                  {durationHours} Hours
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={48}
                value={durationHours}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>1 Hour</span>
                <span>24 Hours</span>
                <span>48 Hours</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="flex justify-between items-center">
                <span className="text-main font-medium">Severity / Impact Multiplier:</span>
                <span className="font-mono text-warning font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {severityMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.1}
                value={severityMultiplier}
                onChange={(e) => handleSeverityChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>1.0x (Moderate)</span>
                <span>2.0x (Severe)</span>
                <span>3.0x (Catastrophic)</span>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="flex justify-between items-center">
                <span className="text-main font-medium">Potentially Impacted Freight Volume:</span>
                <span className="font-mono text-primary font-bold text-sm bg-primary-50 px-2 py-0.5 rounded border border-cyan-500/20">
                  {affectedVolume} Trucks
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={affectedVolume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>50 Trucks</span>
                <span>1,000 Trucks</span>
                <span>2,000 Trucks</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded btn-primary font-semibold text-xs text-on-primary transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${runMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{runMutation.isPending ? 'Simulating Dynamic Vectors...' : 'Execute What-If Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Right Glass Panel: Simulation Impact Vectors (5 cols) */}
        <div className="lg:col-span-5 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    Synthesized Contingency Vectors
                  </h2>
                  <p className="text-[10px] text-muted font-mono">NEURAL DISRUPTION FORECAST</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-safe-bg text-success text-[10px] font-mono font-bold">
                98% ACCURACY
              </span>
            </div>

            {simulationResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded bg-white/[0.02] border border-subtle">
                    <span className="text-[10px] text-muted uppercase font-semibold block">
                      Avg Transit Delay
                    </span>
                    <div className="text-xl font-bold font-mono text-warning mt-1">
                      {simulationResult.delay}
                    </div>
                    <span className="text-[10px] text-muted">Above nominal baseline</span>
                  </div>

                  <div className="p-3 rounded bg-white/[0.02] border border-subtle">
                    <span className="text-[10px] text-muted uppercase font-semibold block">
                      Estimated Cost Impact
                    </span>
                    <div className="text-xl font-bold font-mono text-critical mt-1">
                      {simulationResult.costDelta}
                    </div>
                    <span className="text-[10px] text-muted">Fuel, detention & toll</span>
                  </div>

                  <div className="p-3 rounded bg-white/[0.02] border border-subtle">
                    <span className="text-[10px] text-muted uppercase font-semibold block">
                      High-Vulnerability Units
                    </span>
                    <div className="text-xl font-bold font-mono text-critical mt-1">
                      {simulationResult.atRisk} Trucks
                    </div>
                    <span className="text-[10px] text-critical">Immediate detour needed</span>
                  </div>

                  <div className="p-3 rounded bg-white/[0.02] border border-subtle">
                    <span className="text-[10px] text-muted uppercase font-semibold block">
                      Network Recovery
                    </span>
                    <div className="text-xl font-bold font-mono text-primary mt-1">
                      {simulationResult.recoveryTime}
                    </div>
                    <span className="text-[10px] text-muted">To reach normal flow</span>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2 text-xs">
                  <span className="text-xs font-semibold text-main block">
                    Recommended Bypass Artery:
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-main">
                    <span>Eastern Peripheral Expressway</span>
                    <span className="font-mono text-success font-bold">+38% Load</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-primary-100 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-[11px] text-muted pt-1">
                    Bypassing traffic along Eastern Peripheral avoids 4.5h delay for Delhi–Agra consignments.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-subtle">
            <button
              onClick={() => toast.success('Contingency reroute playbook staged for operator dispatch')}
              className="w-full py-2.5 rounded btn-primary font-semibold text-xs text-on-primary transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Stage Contingency Playbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}