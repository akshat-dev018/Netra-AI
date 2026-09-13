'use client';

import { useQuery } from '@tanstack/react-query';
import { riskApi } from '@/lib/api';
import {
  Flame,
  AlertOctagon,
  TrendingDown,
  MapPin,
  ShieldCheck,
  BarChart2,
  Calendar,
} from 'lucide-react';

export default function AccidentRiskPage() {
  const { data: accidents, isLoading } = useQuery({
    queryKey: ['risk-accidents'],
    queryFn: async () => {
      const res = await riskApi.getAccidents();
      return res.data.data;
    },
  });

  const hotspots = [
    { name: 'NH-44 Km 42 (Faridabad Overbridge)', density: 'Critical Density', score: 88, incidents: 14, primaryCause: 'Merging traffic & blind apex' },
    { name: 'NH-44 Km 78 (Palwal Toll Approach)', density: 'High Density', score: 72, incidents: 9, primaryCause: 'Sudden deceleration & heavy fog' },
    { name: 'Mathura Bypass Junction Km 132', density: 'Moderate Density', score: 54, incidents: 6, primaryCause: 'Commercial vehicle turnaround' },
    { name: 'Agra Outer Ring Road Convergence', density: 'Moderate Density', score: 48, incidents: 5, primaryCause: 'Lane shifting & construction' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl font-bold text-main font-mono tracking-tight">
            ACCIDENT DENSITY & BLACKSPOT INTELLIGENCE
          </h1>
          <span className="px-2 py-0.5 rounded bg-critical-50 text-critical text-[10px] font-mono font-semibold">
            HOTSPOT MAPPER
          </span>
        </div>
        <p className="text-xs text-muted mt-0.5">
          Spatial clustering analysis of historical collisions and dynamic hazard zones along NH-44 and NCR corridors.
        </p>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotspots.map((h, i) => (
          <div
            key={i}
            className="p-5 rounded bg-card border border-subtle backdrop-blur-md space-y-4 hover:border-rose-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-critical-50 text-critical border border-rose-500/40 uppercase">
                {h.density}
              </span>
              <span className="text-critical font-mono font-bold text-sm">Cluster Risk: {h.score}/100</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-main flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-critical shrink-0" />
                <span>{h.name}</span>
              </h3>
              <p className="text-xs text-muted mt-1">
                Root Cause: <b className="text-main">{h.primaryCause}</b>
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-card border border-subtle text-xs">
              <div>
                <span className="text-muted text-[10px] block">Quarterly Collisions</span>
                <span className="font-mono font-bold text-main">{h.incidents} Recorded</span>
              </div>
              <div>
                <span className="text-muted text-[10px] block">Escort Recommended</span>
                <span className="font-semibold text-warning">Yes (Night Shift)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
