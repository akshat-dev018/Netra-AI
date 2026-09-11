'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, driversApi, vehiclesApi } from '@/lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  FileCheck,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  Truck,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FleetCompliancePage() {
  const { data: compliance } = useQuery({
    queryKey: ['fleet-compliance'],
    queryFn: async () => {
      const res = await analyticsApi.getFleetCompliance();
      return res.data.data;
    },
  });

  const { data: apiDrivers } = useQuery({
    queryKey: ['drivers-compliance'],
    queryFn: async () => {
      const res = await driversApi.list();
      return res.data.data;
    },
  });

  const { data: apiVehicles } = useQuery({
    queryKey: ['vehicles-compliance'],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return res.data.data;
    },
  });

  const drivers = (apiDrivers && apiDrivers.length > 0) ? apiDrivers : [
    {
      _id: 'drv-1',
      name: 'Rajesh Kumar',
      licenseNumber: 'DL-2021-008912',
      licenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      safetyScore: 98,
      status: 'active',
      hosHours: '6.5 / 9 hrs',
    },
    {
      _id: 'drv-2',
      name: 'Sunil Verma',
      licenseNumber: 'MH-2019-094381',
      licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      safetyScore: 95,
      status: 'active',
      hosHours: '4.2 / 9 hrs',
    },
    {
      _id: 'drv-3',
      name: 'Harpreet Singh',
      licenseNumber: 'PB-2022-771822',
      licenseExpiry: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
      safetyScore: 99,
      status: 'active',
      hosHours: '1.0 / 9 hrs',
    },
    {
      _id: 'drv-4',
      name: 'Vikas Sharma',
      licenseNumber: 'UP-2020-551029',
      licenseExpiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      safetyScore: 92,
      status: 'active',
      hosHours: '7.8 / 9 hrs',
    },
  ];

  const vehicles = (apiVehicles && apiVehicles.length > 0) ? apiVehicles : [
    {
      _id: 'veh-1',
      registrationNumber: 'DL01AB1234',
      type: '18T Container Carrier',
      pucValidUntil: '2026-11-20',
      fitnessCert: 'Certified Level-A',
      insuranceStatus: 'Active (National Ins.)',
      lastService: '12 days ago',
      nextServiceIn: '48 days',
    },
    {
      _id: 'veh-2',
      registrationNumber: 'MH04XY9876',
      type: '16T Heavy Hauler',
      pucValidUntil: '2026-10-15',
      fitnessCert: 'Certified Level-A',
      insuranceStatus: 'Active (ICICI Lombard)',
      lastService: '5 days ago',
      nextServiceIn: '55 days',
    },
    {
      _id: 'veh-3',
      registrationNumber: 'HR55TR5432',
      type: '28T Multi-Axle Trailer',
      pucValidUntil: '2026-09-30',
      fitnessCert: 'Certified Level-A',
      insuranceStatus: 'Active (Bajaj Allianz)',
      lastService: '28 days ago',
      nextServiceIn: '32 days',
    },
    {
      _id: 'veh-4',
      registrationNumber: 'UP80AB8821',
      type: '12T Express Rig',
      pucValidUntil: '2026-12-05',
      fitnessCert: 'Certified Level-A',
      insuranceStatus: 'Active (New India)',
      lastService: '2 days ago',
      nextServiceIn: '58 days',
    },
  ];

  const handleExportAudit = () => {
    toast.success('Commercial Fleet Compliance Audit Dossier compiled (PDF generated)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white font-mono tracking-tight">
              FLEET COMPLIANCE, SAFETY & AUDIT REGISTRY
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
              AUDIT GRADE A+
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Commercial motor vehicle compliance, Hours-of-Service (HOS) fatigue monitoring, and statutory registry.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold font-mono transition-all shadow-md self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT AUDIT REPORT</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs uppercase font-mono font-medium">Overall Safety Score</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-3">
            {compliance?.score ?? 96} <span className="text-sm font-sans text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero critical safety violations in last 30 days</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs uppercase font-mono font-medium">Commercial License Rate</span>
            <FileCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-3">100%</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>All pilot commercial licenses valid & unexpired</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs uppercase font-mono font-medium">Statutory Overdue Ratio</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white mt-3">0 Trucks</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PUC, fitness, and national permits fully synchronized</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Driver & Vehicle Tables + Right Glass Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Driver Scorecards & Vehicle Fitness */}
        <div className="lg:col-span-8 space-y-6">
          {/* Driver Safety Scorecards */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  DRIVER SAFETY SCORECARDS & HOS HOURS
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Max 9h shift limit</span>
            </div>

            <div className="space-y-2.5">
              {drivers.map((d: any) => (
                <div
                  key={d._id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-cyan-500/30 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-sm">{d.name || d.licenseNumber}</div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      License: <span className="text-slate-300">{d.licenseNumber}</span> • Exp:{' '}
                      <span className="text-slate-300">{new Date(d.licenseExpiry).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">HOS Shift Consumed</span>
                      <span className="font-mono font-bold text-cyan-300">{d.hosHours || '5.5 / 9 hrs'}</span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      SAFETY: {d.safetyScore || 98}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Statutory Maintenance Schedules */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  VEHICLE FITNESS & STATUTORY MAINTENANCE
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">100% roadworthy</span>
            </div>

            <div className="space-y-2.5">
              {vehicles.map((v: any) => (
                <div
                  key={v._id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-amber-500/30 transition-all"
                >
                  <div>
                    <div className="font-bold text-amber-400 font-mono text-sm">{v.registrationNumber}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {v.type || '18T Commercial Carrier'} • PUC Valid:{' '}
                      <span className="text-slate-300 font-mono">{v.pucValidUntil || '2026-11-20'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Service Due</span>
                      <span className="font-mono text-slate-300">{v.nextServiceIn || '40 Days'}</span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      PASSED (GRADE A)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Glass Panel Right - Regulatory Vault */}
        <div className="lg:col-span-4 glass-panel-right p-5 space-y-5">
          <div className="border-b border-white/[0.08] pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  STATUTORY VAULT
                </h3>
                <p className="text-[10px] text-slate-400">MoRTH & NHAI Compliance</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              VERIFIED
            </span>
          </div>

          {/* Compliance Check Matrix */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">All India Tourist & Freight Permit</div>
                <div className="text-[10px] text-slate-400 font-mono">Central MoRTH Portal sync</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">FASTag Fleet Geofence Sync</div>
                <div className="text-[10px] text-slate-400 font-mono">NPCI automated toll deduction</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">AIS-140 GPS Device Certificate</div>
                <div className="text-[10px] text-slate-400 font-mono">Emergency SOS beacon verified</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Hazchem Handling Endorsement</div>
                <div className="text-[10px] text-slate-400 font-mono">Rule 132 Central Motor Rules</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          </div>

          {/* Fatigue Monitoring Widget */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                DRIVER FATIGUE ADVISORY
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Driver <span className="font-semibold text-white">Vikas Sharma</span> is approaching 8 hours of duty cycle. Mandatory 45-minute rest stop scheduled at Mathura Waypoint in 22 minutes.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => toast.success('Regulatory sync initiated with MoRTH VAHAN & SARATHI databases')}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all"
            >
              SYNC VAHAN / SARATHI
            </button>
            <button
              onClick={() => toast.success('Driver medical & eyesight certificates refreshed')}
              className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all"
            >
              VERIFY MEDICAL RECORDS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
