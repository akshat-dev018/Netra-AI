'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi, vehiclesApi } from '@/lib/api';
import {
  Users,
  Plus,
  Search,
  Phone,
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    password: 'NetraDemo123!',
    licenseNumber: '',
    phone: '',
    emergencyContact: '',
    assignedVehicleId: '',
  });

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers-list'],
    queryFn: async () => {
      const res = await driversApi.list();
      return res.data.data;
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-options'],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return res.data.data;
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: typeof newDriver) => {
      await driversApi.create({
        ...data,
        licenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Driver onboarded to fleet roster');
      setShowAddModal(false);
      setNewDriver({
        name: '',
        email: '',
        password: 'NetraDemo123!',
        licenseNumber: '',
        phone: '',
        emergencyContact: '',
        assignedVehicleId: '',
      });
      queryClient.invalidateQueries({ queryKey: ['drivers-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to onboard driver');
    },
  });

  const defaultDrivers = [
    {
      _id: 'd1',
      name: 'Ramesh Singh',
      phone: '+91-98765-43210',
      licenseNumber: 'DL-1420110012345',
      status: 'available',
      assignedVehicle: 'DL-01-AB-1234',
      safetyScore: 98,
    },
    {
      _id: 'd2',
      name: 'Suresh Yadav',
      phone: '+91-98123-45678',
      licenseNumber: 'HR-0620150067890',
      status: 'en_route',
      assignedVehicle: 'HR-55-CD-5678',
      safetyScore: 94,
    },
    {
      _id: 'd3',
      name: 'Virender Gill',
      phone: '+91-98999-11223',
      licenseNumber: 'PB-1020180098765',
      status: 'available',
      assignedVehicle: 'RJ-14-GH-3456',
      safetyScore: 96,
    },
  ];

  const displayDrivers = drivers && drivers.length > 0 ? drivers : defaultDrivers;

  const filtered = displayDrivers.filter((d: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-success" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Driver Roster & Shift Roster
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-success-50 border border-emerald-500/30 text-success font-mono text-[10px] font-semibold uppercase">
              {displayDrivers.length} CERTIFIED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Heavy commercial license verification, driver shift tracking, and emergency contacts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search driver name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9 pr-3 py-2 rounded text-xs text-main placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded btn-success text-xs font-semibold text-white transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Driver</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d: any) => {
          const isAvailable = d.status === 'available';

          return (
            <div
              key={d._id}
              className="glass-card p-5 sm:p-6 rounded flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-safe-bg border border-emerald-500/30 text-success font-bold font-mono text-xs flex items-center justify-center">
                      {d.name ? d.name.charAt(0) : 'D'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-main">{d.name || 'Commercial Driver'}</h3>
                      <span className="text-[10px] text-muted font-mono">{d.phone || '+91-9800000001'}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isAvailable
                        ? 'bg-safe-bg text-success border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-primary border border-subtle'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted">License No:</span>
                    <span className="font-mono text-main font-medium">{d.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted">Assigned Vehicle:</span>
                    <span className="font-mono text-primary">{d.assignedVehicle || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted">Safety Index:</span>
                <span className="font-mono text-success font-bold text-xs">
                  {d.safetyScore || 96}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Onboard Commercial Driver</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Yadav"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="+91-9876543210"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Heavy Commercial License No. *</label>
                <input
                  type="text"
                  placeholder="DL-1420110012345"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Assigned Vehicle</label>
                <select
                  value={newDriver.assignedVehicleId}
                  onChange={(e) => setNewDriver({ ...newDriver, assignedVehicleId: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="">-- Choose Truck (Optional) --</option>
                  {vehicles?.map((v: any) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newDriver.phone || !newDriver.licenseNumber) {
                    toast.error('Please enter phone and license number');
                    return;
                  }
                  createDriverMutation.mutate(newDriver);
                }}
                disabled={createDriverMutation.isPending}
                className="px-4 py-2 rounded btn-success text-xs font-semibold text-white"
              >
                {createDriverMutation.isPending ? 'Onboarding...' : 'Onboard Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
