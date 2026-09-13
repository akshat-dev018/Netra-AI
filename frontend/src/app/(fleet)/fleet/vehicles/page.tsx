'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/lib/api';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Wrench,
  Fuel,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [newVehicle, setNewVehicle] = useState({
    registrationNumber: '',
    type: 'Trailer 40T',
    capacity: 40,
    status: 'active',
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return res.data.data;
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: typeof newVehicle) => {
      await vehiclesApi.create({
        ...data,
        capacity: Number(data.capacity),
      });
    },
    onSuccess: () => {
      toast.success('Vehicle registered into fleet registry');
      setShowAddModal(false);
      setNewVehicle({ registrationNumber: '', type: 'Trailer 40T', capacity: 40, status: 'active' });
      queryClient.invalidateQueries({ queryKey: ['vehicles-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to add vehicle');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await vehiclesApi.update(id, { status });
    },
    onSuccess: () => {
      toast.success('Vehicle status updated');
      queryClient.invalidateQueries({ queryKey: ['vehicles-list'] });
    },
  });

  const defaultVehicles = [
    { _id: 'v1', registrationNumber: 'DL-01-AB-1234', type: 'Trailer 40T', capacity: 40, status: 'active', fuel: '84%', speed: '62 km/h' },
    { _id: 'v2', registrationNumber: 'HR-55-CD-5678', type: 'Multi-Axle 24T', capacity: 24, status: 'active', fuel: '68%', speed: '54 km/h' },
    { _id: 'v3', registrationNumber: 'UP-32-EF-9012', type: 'Refrigerated 18T', capacity: 18, status: 'maintenance', fuel: '40%', speed: '0 km/h' },
    { _id: 'v4', registrationNumber: 'RJ-14-GH-3456', type: 'ISO Tanker 28T', capacity: 28, status: 'active', fuel: '92%', speed: '68 km/h' },
  ];

  const displayVehicles = vehicles && vehicles.length > 0 ? vehicles : defaultVehicles;

  const filtered = displayVehicles.filter((v: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.registrationNumber?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q) ||
      v.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-warning" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Fleet Vehicle Registry
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-warning font-mono text-[10px] font-semibold uppercase">
              {displayVehicles.length} TRUCKS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Heavy commercial vehicles, fuel telemetry, fitness certificates, and maintenance status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search registration, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9 pr-3 py-2 rounded text-xs text-main placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded btn-warning text-xs font-semibold text-white transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((v: any) => {
          const isActive = v.status === 'active';

          return (
            <div
              key={v._id}
              className="glass-card p-5 rounded flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-primary">
                    {v.type || 'Heavy Truck'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isActive
                        ? 'bg-safe-bg text-success border border-emerald-500/30'
                        : 'bg-warning-50 text-warning border border-amber-500/30'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-main font-mono">{v.registrationNumber}</h3>
                  <div className="text-xs text-muted mt-0.5">Payload Capacity: {v.capacity || 18} Tons</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-muted block text-[10px]">Fuel Level</span>
                    <span className="font-mono font-bold text-success">{v.fuel || '82%'}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-muted block text-[10px]">Current Speed</span>
                    <span className="font-mono font-bold text-primary">{v.speed || '58 km/h'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between">
                <span className="text-[10px] text-muted">State:</span>
                <select
                  value={v.status}
                  onChange={(e) => updateStatusMutation.mutate({ id: v._id, status: e.target.value })}
                  className="glass-input px-2.5 py-1 rounded text-xs text-main focus:outline-none bg-card"
                >
                  <option value="active">Active (En-Route)</option>
                  <option value="idle">Idle (Depot)</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Register Commercial Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g. DL-01-AB-1234"
                  value={newVehicle.registrationNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main font-mono text-xs focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Vehicle Classification</label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="Trailer 40T">40-Ton Prime Mover Trailer</option>
                  <option value="Multi-Axle 24T">24-Ton Multi-Axle Rigid Truck</option>
                  <option value="Refrigerated 18T">18-Ton Temperature Controlled</option>
                  <option value="Tanker 28T">28-Ton Hazardous Liquid Tanker</option>
                </select>
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Payload Capacity (Tons)</label>
                <input
                  type="number"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 18 })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
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
                  if (!newVehicle.registrationNumber) {
                    toast.error('Please enter registration number');
                    return;
                  }
                  createVehicleMutation.mutate(newVehicle);
                }}
                disabled={createVehicleMutation.isPending}
                className="px-4 py-2 rounded btn-warning text-xs font-semibold text-white"
              >
                {createVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
