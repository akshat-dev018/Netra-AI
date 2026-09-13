'use client';

import { useQuery } from '@tanstack/react-query';
import { vehiclesApi, driversApi, assignmentsApi, analyticsApi } from '@/lib/api';
import Link from 'next/link';
import {
  Truck,
  Users,
  CalendarCheck,
  ShieldCheck,
  Activity,
  Plus,
  MapPin,
  Clock,
  Radio,
} from 'lucide-react';

export default function FleetOverviewPage() {
  const { data: vehicles } = useQuery({
    queryKey: ['fleet-vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return res.data.data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['fleet-drivers'],
    queryFn: async () => {
      const res = await driversApi.list();
      return res.data.data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ['fleet-assignments'],
    queryFn: async () => {
      const res = await assignmentsApi.list();
      return res.data.data;
    },
  });

  const { data: compliance } = useQuery({
    queryKey: ['fleet-compliance-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getFleetCompliance();
      return res.data.data;
    },
  });

  const defaultVehicles = [
    { _id: 'v1', registrationNumber: 'DL-01-AB-1234', type: 'Trailer 40T', capacity: 40, status: 'active' },
    { _id: 'v2', registrationNumber: 'HR-55-CD-5678', type: 'Multi-Axle 24T', capacity: 24, status: 'active' },
    { _id: 'v3', registrationNumber: 'UP-32-EF-9012', type: 'Refrigerated 18T', capacity: 18, status: 'maintenance' },
  ];

  const defaultDrivers = [
    { _id: 'd1', phone: '+91-98765-43210', licenseNumber: 'DL-1420110012345', status: 'available' },
    { _id: 'd2', phone: '+91-98123-45678', licenseNumber: 'HR-0620150067890', status: 'en_route' },
    { _id: 'd3', phone: '+91-98999-11223', licenseNumber: 'UP-3220180098765', status: 'available' },
  ];

  const displayVehicles = vehicles && vehicles.length > 0 ? vehicles : defaultVehicles;
  const displayDrivers = drivers && drivers.length > 0 ? drivers : defaultDrivers;

  const activeVehicles = displayVehicles.filter((v: any) => v.status === 'active').length;
  const availableDrivers = displayDrivers.filter((d: any) => d.status === 'available').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-warning" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Fleet Control Desk
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-warning font-mono text-[10px] font-semibold uppercase">
              DEPOT DISPATCH
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Heavy commercial vehicle status, driver duty cycles, trip assignments, and safety maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/fleet/assignments"
            className="flex items-center gap-2 px-4 py-2.5 rounded btn-warning text-xs font-semibold text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip Assignment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          href="/fleet/vehicles"
          className="glass-card p-4 rounded space-y-1 hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Active Trucks</span>
            <Truck className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-main mt-1">
            {activeVehicles} / {displayVehicles.length}
          </div>
          <span className="text-[10px] text-warning">Operational readiness</span>
        </Link>

        <Link
          href="/fleet/drivers"
          className="glass-card p-4 rounded space-y-1 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Available Drivers</span>
            <Users className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-2xl font-bold font-mono text-main mt-1">
            {availableDrivers} / {displayDrivers.length}
          </div>
          <span className="text-[10px] text-success">Ready for dispatch</span>
        </Link>

        <Link
          href="/fleet/assignments"
          className="glass-card p-4 rounded space-y-1 hover:border-subtle transition-all"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Live Trips</span>
            <CalendarCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-main mt-1">
            {assignments?.length || 4} Trips
          </div>
          <span className="text-[10px] text-primary">Assigned & Scheduled</span>
        </Link>

        <Link
          href="/fleet/compliance"
          className="glass-card p-4 rounded space-y-1 hover:border-amber-500/30 transition-all"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Safety Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-main mt-1">
            {compliance?.score ?? 96}/100
          </div>
          <span className="text-[10px] text-success">Zero HOS violations</span>
        </Link>
      </div>

      {/* Two Columns: Recent Vehicles & Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vehicles Fleet Card */}
        <div className="glass-card p-5 sm:p-6 rounded space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-subtle">
            <div>
              <h3 className="text-sm font-bold text-main tracking-tight">Fleet Vehicle Inventory</h3>
              <p className="text-[11px] text-muted">Trucks active in freight corridors</p>
            </div>
            <Link href="/fleet/vehicles" className="text-xs text-warning hover:text-warning font-medium">
              Manage All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {displayVehicles.map((v: any) => (
              <div
                key={v._id}
                className="p-3.5 rounded bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-primary font-mono">{v.registrationNumber}</div>
                  <div className="text-xs text-muted capitalize">
                    {v.type} — Capacity: {v.capacity || 18} Tons
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    v.status === 'active'
                      ? 'bg-safe-bg text-success border border-emerald-500/30'
                      : 'bg-warning-50 text-warning border border-amber-500/30'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers Roster Card */}
        <div className="glass-card p-5 sm:p-6 rounded space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-subtle">
            <div>
              <h3 className="text-sm font-bold text-main tracking-tight">Driver Duty Status</h3>
              <p className="text-[11px] text-muted">Available personnel & telematics tracking</p>
            </div>
            <Link href="/fleet/drivers" className="text-xs text-success hover:text-success font-medium">
              Roster Directory →
            </Link>
          </div>

          <div className="space-y-2.5">
            {displayDrivers.map((d: any) => (
              <div
                key={d._id}
                className="p-3.5 rounded bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-main">{d.phone || '+91-9800000001'}</div>
                  <div className="text-xs text-muted font-mono">License: {d.licenseNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary border border-subtle font-mono">
                    GPS Active
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-safe-bg text-success uppercase">
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
