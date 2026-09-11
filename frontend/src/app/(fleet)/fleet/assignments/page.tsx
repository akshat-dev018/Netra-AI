'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, driversApi, vehiclesApi, shipmentsApi } from '@/lib/api';
import {
  CalendarCheck,
  Plus,
  Truck,
  Users,
  Package,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    driverId: '',
    vehicleId: '',
    shipmentId: '',
    startsAt: new Date().toISOString().slice(0, 16),
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments-list'],
    queryFn: async () => {
      const res = await assignmentsApi.list();
      return res.data.data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers-options'],
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

  const { data: shipments } = useQuery({
    queryKey: ['shipments-options'],
    queryFn: async () => {
      const res = await shipmentsApi.list();
      return res.data.data;
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: typeof newAssignment) => {
      await assignmentsApi.create({
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        shipmentId: data.shipmentId,
        startsAt: new Date(data.startsAt).toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Trip assignment allocated and pushed to driver terminal');
      setShowAddModal(false);
      setNewAssignment({
        driverId: '',
        vehicleId: '',
        shipmentId: '',
        startsAt: new Date().toISOString().slice(0, 16),
      });
      queryClient.invalidateQueries({ queryKey: ['assignments-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Assignment creation failed');
    },
  });

  const defaultAssignments = [
    {
      _id: 'a1',
      shipment: { reference: 'SHP-8821', origin: 'Delhi ICD', destination: 'JNPT Mumbai' },
      driver: { name: 'Ramesh Singh', phone: '+91-98765-43210' },
      vehicle: { registrationNumber: 'DL-01-AB-1234', type: 'Trailer 40T' },
      status: 'active',
      startsAt: new Date().toISOString(),
    },
    {
      _id: 'a2',
      shipment: { reference: 'SHP-9043', origin: 'Chennai Port', destination: 'Bengaluru ICD' },
      driver: { name: 'Suresh Yadav', phone: '+91-98123-45678' },
      vehicle: { registrationNumber: 'HR-55-CD-5678', type: 'Multi-Axle 24T' },
      status: 'active',
      startsAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];

  const displayAssignments = assignments && assignments.length > 0 ? assignments : defaultAssignments;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Trip & Duty Assignments
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-semibold uppercase">
              ACTIVE TRIPS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Link consignments, trucks, and certified drivers into scheduled freight dispatches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayAssignments.map((a: any) => {
          const isActive = a.status === 'active' || a.status === 'assigned';

          return (
            <div
              key={a._id}
              className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-cyan-400">
                    {a.shipment?.reference || 'CONSIGNMENT'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.status || 'Active'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Route Transit</div>
                  <div className="font-semibold text-white text-sm">
                    {a.shipment?.origin || 'Delhi'} → {a.shipment?.destination || 'Agra'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px] uppercase">Assigned Driver</span>
                    <span className="font-semibold text-slate-200">{a.driver?.name || 'Driver Assigned'}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{a.driver?.phone}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px] uppercase">Assigned Vehicle</span>
                    <span className="font-semibold text-cyan-300 font-mono">
                      {a.vehicle?.registrationNumber || 'DL01AB1234'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{a.vehicle?.type}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Depot Departure:</span>
                </span>
                <span className="font-mono text-white text-[11px]">
                  {new Date(a.startsAt || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-2xl border border-white/[0.1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Allocate Trip Assignment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Select Consignment *</label>
                <select
                  value={newAssignment.shipmentId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, shipmentId: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="">-- Choose Shipment Manifest --</option>
                  {shipments?.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.reference} ({s.origin} → {s.destination})
                    </option>
                  ))}
                  <option value="demo-shipment">SHP-8821 (Delhi ICD → JNPT Mumbai)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assign Driver *</label>
                <select
                  value={newAssignment.driverId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, driverId: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers?.map((d: any) => (
                    <option key={d._id} value={d._id}>
                      {d.name || d.phone} ({d.status})
                    </option>
                  ))}
                  <option value="demo-driver">Ramesh Singh (+91-98765-43210)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assign Truck *</label>
                <select
                  value={newAssignment.vehicleId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, vehicleId: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles?.map((v: any) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.type})
                    </option>
                  ))}
                  <option value="demo-vehicle">DL-01-AB-1234 (Trailer 40T)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Departure Schedule</label>
                <input
                  type="datetime-local"
                  value={newAssignment.startsAt}
                  onChange={(e) => setNewAssignment({ ...newAssignment, startsAt: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createAssignmentMutation.mutate(newAssignment);
                }}
                disabled={createAssignmentMutation.isPending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/20"
              >
                {createAssignmentMutation.isPending ? 'Allocating...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
