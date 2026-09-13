'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi, corridorsApi } from '@/lib/api';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  MapPin,
  Calendar,
  X,
  Bot,
  ArrowRight,
  ShieldAlert,
  Radio,
  Navigation,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShipmentsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  // Form State for new shipment
  const [newShipment, setNewShipment] = useState({
    reference: '',
    origin: '',
    destination: '',
    carrier: 'NETRA Logistics',
    priority: 'high',
    cargoType: 'container',
    eta: '',
    currentCorridorId: '',
  });

  // CSV Import state
  const [csvContent, setCsvContent] = useState<string>(
    'reference,origin,destination,carrier,priority,cargoType\nSHP-IMPORT-001,Delhi ICD,Agra Dry Port,NETRA Logistics,high,container\nSHP-IMPORT-002,Gurugram Hub,Jaipur Logistics Park,FastTrack Freight,medium,refrigerated'
  );

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments', filterStatus],
    queryFn: async () => {
      const res = await shipmentsApi.list(filterStatus === 'all' ? undefined : { status: filterStatus });
      return res.data.data;
    },
    staleTime: 10_000,
  });

  const { data: corridors } = useQuery({
    queryKey: ['corridors-options'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newShipment) => {
      await shipmentsApi.create({
        ...data,
        eta: data.eta ? new Date(data.eta).toISOString() : undefined,
        currentCorridorId: data.currentCorridorId || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Shipment registered successfully');
      setShowCreateModal(false);
      setNewShipment({
        reference: '',
        origin: '',
        destination: '',
        carrier: 'NETRA Logistics',
        priority: 'high',
        cargoType: 'container',
        eta: '',
        currentCorridorId: '',
      });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create shipment');
    },
  });

  const importMutation = useMutation({
    mutationFn: async (csv: string) => {
      const res = await shipmentsApi.importCsv(csv);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.data?.imported ?? 0} shipments successfully!`);
      setShowImportModal(false);
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'CSV Import failed');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await shipmentsApi.update(id, { status });
    },
    onSuccess: () => {
      toast.success('Shipment status updated');
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    },
  });

  const filtered = shipments?.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.reference?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.carrier?.toLowerCase().includes(q)
    );
  });

  // Active inspected shipment (default to first if none selected)
  const inspected = selectedShipment || (filtered && filtered.length > 0 ? filtered[0] : null);

  const totalCount = shipments?.length || 0;
  const inTransitCount = shipments?.filter((s: any) => s.status === 'in_transit').length || 0;
  const delayedCount = shipments?.filter((s: any) => s.status === 'delayed' || (s.riskScore && s.riskScore > 50)).length || 0;
  const deliveredCount = shipments?.filter((s: any) => s.status === 'delivered').length || 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Shipment Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
              MANIFEST CONTROL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time tracking, dynamic risk scoring, and predictive ETA modeling across Indian freight corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded glass-card text-xs font-medium text-main hover:text-main hover:border-subtle transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-success" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded btn-primary text-xs font-semibold text-on-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Shipment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
            Total Monitored
          </span>
          <div className="text-2xl font-bold font-mono text-main">{totalCount}</div>
          <span className="text-[10px] text-muted">All registered consignments</span>
        </div>

        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
            En-Route Active
          </span>
          <div className="text-2xl font-bold font-mono text-primary">{inTransitCount}</div>
          <span className="text-[10px] text-success">Live GPS tracking</span>
        </div>

        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
            High Risk / Delayed
          </span>
          <div className="text-2xl font-bold font-mono text-critical">{delayedCount}</div>
          <span className="text-[10px] text-critical/80">Requires dispatcher intervention</span>
        </div>

        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
            Delivered (24h)
          </span>
          <div className="text-2xl font-bold font-mono text-success">{deliveredCount}</div>
          <span className="text-[10px] text-muted">On-time rate 94.2%</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All Manifests' },
            { key: 'planned', label: 'Planned' },
            { key: 'in_transit', label: 'In Transit' },
            { key: 'delayed', label: 'Delayed' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === tab.key
                  ? 'bg-cyan-500/20 text-primary border border-subtle font-semibold'
                  : 'text-muted hover:text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search reference, origin, carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-1.5 rounded text-xs text-main placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid: Left 65% Table, Right 35% Glass Panel Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Manifest Table (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-subtle text-muted bg-white/[0.02]">
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Route</th>
                  <th className="py-3 px-4 font-semibold">Carrier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Risk</th>
                  <th className="py-3 px-4 font-semibold text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered?.map((s: any) => {
                  const isSelected = inspected?._id === s._id;
                  const isHighRisk = s.riskScore > 50;

                  return (
                    <tr
                      key={s._id}
                      onClick={() => setSelectedShipment(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {s.reference}
                      </td>
                      <td className="py-3 px-4 font-sans text-main">
                        <div className="font-medium truncate max-w-[180px]">
                          {s.origin} → {s.destination}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans text-main truncate max-w-[120px]">
                        {s.carrier || 'NETRA Freight'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            s.status === 'in_transit'
                              ? 'bg-success-50 text-success border border-emerald-500/30'
                              : s.status === 'delayed'
                              ? 'bg-amber-500/15 text-warning border border-amber-500/30'
                              : s.status === 'delivered'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-primary-100 text-muted'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-1.5 rounded-full bg-primary-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHighRisk ? 'bg-rose-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${s.riskScore || 25}%` }}
                            />
                          </div>
                          <span className="font-mono text-muted text-[11px]">
                            {s.riskScore ?? 25}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted text-[11px]">
                        {s.eta ? new Date(s.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:30'}
                      </td>
                    </tr>
                  );
                })}
                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted text-xs">
                      No shipments found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Glass Panel: Detailed Shipment Inspection (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          {inspected ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-subtle">
                <div>
                  <span className="text-[10px] font-mono uppercase text-primary font-bold tracking-wider">
                    {inspected.reference}
                  </span>
                  <h2 className="text-sm font-bold text-main tracking-tight">
                    Active Consignment Telematics
                  </h2>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    inspected.status === 'in_transit'
                      ? 'bg-safe-bg text-success'
                      : 'bg-warning-50 text-warning'
                  }`}
                >
                  {inspected.status}
                </span>
              </div>

              {/* Endpoints & Live Ping */}
              <div className="p-3.5 rounded bg-white/[0.02] border border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Origin Node</span>
                    <span className="font-semibold text-main">{inspected.origin}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <div className="text-right">
                    <span className="text-[10px] text-muted block uppercase">Destination</span>
                    <span className="font-semibold text-main">{inspected.destination}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-primary animate-pulse" /> Live Telematics Ping:
                  </span>
                  <span className="font-mono text-main">KM 184 • NH-48</span>
                </div>
              </div>

              {/* Carrier & Driver Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-white/[0.02] border border-subtle">
                  <span className="text-[10px] text-muted block uppercase">Carrier Entity</span>
                  <span className="font-semibold text-main">{inspected.carrier || 'NETRA Freight'}</span>
                </div>
                <div className="p-2.5 rounded bg-white/[0.02] border border-subtle">
                  <span className="text-[10px] text-muted block uppercase">Assigned Priority</span>
                  <span className="font-semibold text-warning capitalize">{inspected.priority || 'High'}</span>
                </div>
              </div>

              {/* AI Delay & Risk Prediction Box */}
              <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Bot className="w-3 h-3 text-primary" /> AI DELAY FORECAST
                  </span>
                  <span className="font-mono text-critical font-bold">+1h 45m Delay</span>
                </div>
                <p className="text-[11px] text-main leading-snug">
                  Corridor bottleneck detected on NH-48 Jaipur stretch. Recommend dynamic bypass via SH-12.
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href="/routes/optimizer"
                    className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-subtle text-primary text-center text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Optimize Route</span>
                  </Link>
                </div>
              </div>

              {/* Transition Lifecycle Controls */}
              <div className="space-y-2 pt-2 border-t border-subtle">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted block">
                  Quick State Transition:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: inspected._id, status: 'in_transit' })}
                    className="py-2 px-3 rounded-lg bg-success-50 hover:bg-emerald-500/25 border border-emerald-500/30 text-success text-xs font-semibold transition-all"
                  >
                    Mark In-Transit
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: inspected._id, status: 'delayed' })}
                    className="py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-warning text-xs font-semibold transition-all"
                  >
                    Flag Delayed
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: inspected._id, status: 'delivered' })}
                    className="py-2 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all"
                  >
                    Mark Delivered
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: inspected._id, status: 'cancelled' })}
                    className="py-2 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-critical text-xs font-semibold transition-all"
                  >
                    Cancel Shipment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-muted text-xs">
              Select a shipment from the manifest to inspect telematics.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-main">Create New Freight Shipment</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-main font-medium block mb-1">Shipment Reference *</label>
                <input
                  type="text"
                  placeholder="e.g. SHP-NCR-2026-009"
                  value={newShipment.reference}
                  onChange={(e) => setNewShipment({ ...newShipment, reference: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Origin Node *</label>
                <input
                  type="text"
                  placeholder="e.g. Tughlakabad ICD"
                  value={newShipment.origin}
                  onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Destination Node *</label>
                <input
                  type="text"
                  placeholder="e.g. Agra Dry Port"
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Carrier Entity</label>
                <input
                  type="text"
                  placeholder="NETRA Logistics"
                  value={newShipment.carrier}
                  onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Priority Level</label>
                <select
                  value={newShipment.priority}
                  onChange={(e) => setNewShipment({ ...newShipment, priority: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical (SOS Protocol)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newShipment.reference || !newShipment.origin || !newShipment.destination) {
                    toast.error('Please complete reference, origin and destination');
                    return;
                  }
                  createMutation.mutate(newShipment);
                }}
                disabled={createMutation.isPending}
                className="px-4 py-2 rounded btn-primary text-xs font-semibold text-on-primary disabled:opacity-50"
              >
                {createMutation.isPending ? 'Registering...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-success" />
                <h3 className="text-base font-bold text-main">Bulk CSV Shipment Ingestion</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-muted">
                Paste CSV data below with headers: <code className="text-primary font-mono">reference, origin, destination, carrier, priority, cargoType</code>
              </p>
              <textarea
                rows={8}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="glass-input w-full p-3 rounded text-main font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => importMutation.mutate(csvContent)}
                disabled={importMutation.isPending}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-main text-xs font-semibold shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                {importMutation.isPending ? 'Ingesting...' : 'Import Shipments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
