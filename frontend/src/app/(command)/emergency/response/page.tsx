'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyApi } from '@/lib/api';
import {
  LifeBuoy,
  Plus,
  Truck,
  Shield,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResponseUnitsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnit, setNewUnit] = useState({
    name: '',
    type: 'ambulance',
    status: 'available',
    lat: 28.58,
    lng: 77.22,
  });

  const { data: units, isLoading } = useQuery({
    queryKey: ['response-units-list'],
    queryFn: async () => {
      const res = await emergencyApi.listResponseUnits();
      return res.data.data;
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: typeof newUnit) => {
      await emergencyApi.createResponseUnit({
        name: data.name,
        type: data.type,
        status: data.status,
        currentLocation: {
          type: 'Point',
          coordinates: [data.lng, data.lat],
        },
      });
    },
    onSuccess: () => {
      toast.success('Response unit registered to tactical fleet');
      setShowAddModal(false);
      setNewUnit({
        name: '',
        type: 'ambulance',
        status: 'available',
        lat: 28.58,
        lng: 77.22,
      });
      queryClient.invalidateQueries({ queryKey: ['response-units-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create response unit');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await emergencyApi.updateResponseUnit(id, { status });
    },
    onSuccess: () => {
      toast.success('Unit status updated');
      queryClient.invalidateQueries({ queryKey: ['response-units-list'] });
    },
  });

  const defaultUnits = [
    {
      _id: 'u1',
      name: 'NCR Mobile Trauma 1',
      type: 'ambulance',
      status: 'available',
      currentLocation: { coordinates: [77.22, 28.58] },
    },
    {
      _id: 'u2',
      name: 'Highway Patrol Unit 08',
      type: 'police',
      status: 'dispatched',
      currentLocation: { coordinates: [77.35, 28.14] },
    },
    {
      _id: 'u3',
      name: 'Heavy Recovery Crane 02',
      type: 'towing',
      status: 'available',
      currentLocation: { coordinates: [77.68, 27.49] },
    },
  ];

  const displayUnits = units && units.length > 0 ? units : defaultUnits;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Tactical Response Units
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
              TACTICAL FLEET
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Dedicated emergency response: Trauma Ambulances, Highway Patrol, and Road Recovery units.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded btn-primary text-xs font-semibold text-on-primary transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Response Unit</span>
        </button>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayUnits.map((u: any) => {
          const isAvailable = u.status === 'available';

          return (
            <div
              key={u._id}
              className="glass-card p-5 sm:p-6 rounded flex flex-col justify-between space-y-4 hover:border-subtle transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-primary border border-subtle">
                    {u.type}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isAvailable
                        ? 'bg-safe-bg text-success border border-emerald-500/30'
                        : 'bg-warning-50 text-warning border border-amber-500/30'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-main">{u.name}</h3>
                  {u.currentLocation?.coordinates && (
                    <div className="flex items-center gap-1.5 text-muted text-xs mt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>[{u.currentLocation.coordinates[1].toFixed(2)}, {u.currentLocation.coordinates[0].toFixed(2)}]</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted">Duty Status:</span>
                <select
                  value={u.status}
                  onChange={(e) => updateStatusMutation.mutate({ id: u._id, status: e.target.value })}
                  className="glass-input px-2.5 py-1 rounded text-xs text-main focus:outline-none bg-card"
                >
                  <option value="available">Available (Ready)</option>
                  <option value="dispatched">Dispatched (En-Route)</option>
                  <option value="on_scene">On Scene</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Register Response Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Unit Call-Sign / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. NCR Mobile Trauma 2"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Unit Type</label>
                <select
                  value={newUnit.type}
                  onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="ambulance">Trauma Ambulance</option>
                  <option value="police">Highway Patrol (Police)</option>
                  <option value="fire">Fire & Hazmat Unit</option>
                  <option value="towing">Heavy Road Recovery Tow</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-main font-medium block mb-1">Base Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newUnit.lat}
                    onChange={(e) => setNewUnit({ ...newUnit, lat: parseFloat(e.target.value) })}
                    className="glass-input w-full p-2.5 rounded text-main font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-main font-medium block mb-1">Base Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newUnit.lng}
                    onChange={(e) => setNewUnit({ ...newUnit, lng: parseFloat(e.target.value) })}
                    className="glass-input w-full p-2.5 rounded text-main font-mono text-xs focus:outline-none"
                  />
                </div>
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
                  if (!newUnit.name) {
                    toast.error('Please enter a unit name');
                    return;
                  }
                  createUnitMutation.mutate(newUnit);
                }}
                disabled={createUnitMutation.isPending}
                className="px-4 py-2 rounded btn-primary text-xs font-semibold text-on-primary"
              >
                {createUnitMutation.isPending ? 'Registering...' : 'Register Unit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
