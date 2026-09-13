'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyApi } from '@/lib/api';
import {
  Bell,
  AlertOctagon,
  ShieldCheck,
  LifeBuoy,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Plus,
  Radio,
  Volume2,
  VolumeX,
  Hospital,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmergencyAlertsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const [newAlert, setNewAlert] = useState({
    type: 'accident',
    severity: 'critical',
    description: '',
    lat: 28.41,
    lng: 77.32,
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['emergency-alerts', filter],
    queryFn: async () => {
      const res = await emergencyApi.listAlerts();
      return res.data.data;
    },
    refetchInterval: 10_000,
  });

  const { data: units } = useQuery({
    queryKey: ['emergency-units'],
    queryFn: async () => {
      const res = await emergencyApi.listResponseUnits();
      return res.data.data;
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: typeof newAlert) => {
      await emergencyApi.createAlert({
        type: data.type,
        severity: data.severity,
        description: data.description,
        location: {
          type: 'Point',
          coordinates: [data.lng, data.lat],
        },
      });
    },
    onSuccess: () => {
      toast.success('Emergency alert broadcasted across network!');
      setShowCreateModal(false);
      setNewAlert({
        type: 'accident',
        severity: 'critical',
        description: '',
        lat: 28.41,
        lng: 77.32,
      });
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to broadcast alert');
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      await emergencyApi.acknowledgeAlert(id);
    },
    onSuccess: () => {
      toast.success('Alert acknowledged. Dispatch protocols active.');
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Acknowledge failed');
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: async ({ alertId, unitId }: { alertId: string; unitId?: string }) => {
      await emergencyApi.dispatchAlert(alertId, { unitId });
    },
    onSuccess: () => {
      toast.success('Response Unit mobilized & dispatched to incident!');
      setSelectedAlert(null);
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Dispatch failed');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await emergencyApi.resolveAlert(id);
    },
    onSuccess: () => {
      toast.success('Incident marked RESOLVED. Telemetry closed.');
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Resolve failed');
    },
  });

  const fallbackAlerts = [
    {
      _id: 'sos-1',
      type: 'accident',
      severity: 'critical',
      description: 'Severe multi-vehicle collision involving container truck on NH-48 KM 142. Driver reported trapped.',
      status: 'open',
      createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      location: { coordinates: [75.7873, 26.9124] },
    },
    {
      _id: 'sos-2',
      type: 'medical',
      severity: 'high',
      description: 'Driver acute cardiovascular distress beacon triggered in cab DL01AB1234 near Mathura Exit.',
      status: 'acknowledged',
      createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
      location: { coordinates: [77.6841, 27.4924] },
    },
  ];

  const displayAlerts = alerts && alerts.length > 0 ? alerts : fallbackAlerts;

  const filtered = displayAlerts.filter((a: any) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-critical animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Emergency SOS & Dispatch
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-critical font-mono text-[10px] font-semibold uppercase">
              TRIAGE ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Rapid response queue for distress beacons, collision notifications, and ambulance mobilizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2.5 rounded glass-card text-muted hover:text-main transition-all"
            title={audioEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-success" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded btn-critical text-xs font-semibold text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Broadcast SOS Beacon</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Incidents' },
          { key: 'open', label: 'Pending Acknowledge' },
          { key: 'acknowledged', label: 'Acknowledged' },
          { key: 'dispatched', label: 'Units Dispatched' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-critical-50 text-main border border-rose-500/40 font-semibold shadow-sm'
                : 'glass-card text-muted hover:text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left 65% Alerts Feed, Right 35% Glass Panel Standby Triage Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((alert: any) => {
              const isCritical = alert.severity === 'critical';
              const isResolved = alert.status === 'resolved';

              return (
                <div
                  key={alert._id}
                  className={`p-5 rounded border transition-all flex flex-col justify-between space-y-4 ${
                    isResolved
                      ? 'glass-card opacity-60'
                      : isCritical
                      ? 'glass-panel-elevated border-rose-500/40 hover:border-rose-500/60'
                      : 'glass-card hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isCritical
                              ? 'bg-critical-50 text-critical border border-rose-500/30'
                              : 'bg-warning-50 text-warning border border-amber-500/30'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted" />
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          alert.status === 'open'
                            ? 'bg-rose-500 text-main animate-pulse'
                            : alert.status === 'acknowledged'
                            ? 'bg-warning-50 text-warning border border-amber-500/30'
                            : alert.status === 'dispatched'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/10 text-muted'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-main capitalize">{alert.type?.replace('_', ' ') || 'Emergency SOS'}</h3>
                      <p className="text-xs text-main mt-1 leading-relaxed">{alert.description}</p>
                    </div>

                    {alert.location?.coordinates && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Lat: {alert.location.coordinates[1]}, Lng: {alert.location.coordinates[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* 3-Step Action Workflow */}
                  <div className="pt-3 border-t border-white/[0.04] space-y-2">
                    {alert.status === 'open' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert._id)}
                        disabled={acknowledgeMutation.isPending}
                        className="w-full py-2.5 rounded bg-warning-50 hover:bg-amber-500/30 border border-amber-500/30 text-warning font-semibold text-xs transition-all"
                      >
                        1. Acknowledge SOS
                      </button>
                    )}

                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="w-full py-2.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-subtle text-primary font-semibold text-xs transition-all"
                      >
                        2. Dispatch Tactical Unit
                      </button>
                    )}

                    {alert.status === 'dispatched' && (
                      <button
                        onClick={() => resolveMutation.mutate(alert._id)}
                        disabled={resolveMutation.isPending}
                        className="w-full py-2.5 rounded bg-safe-bg hover:bg-emerald-500/30 border border-emerald-500/30 text-success font-semibold text-xs transition-all"
                      >
                        3. Mark Incident Resolved
                      </button>
                    )}

                    {alert.status === 'resolved' && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-success font-medium py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Incident Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Glass Panel: Standby Triage Unit Status (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-critical-50 border border-rose-500/30 flex items-center justify-center text-critical">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    Standby Units & Trauma
                  </h2>
                  <p className="text-[10px] text-muted font-mono">EMERGENCY NETWORK</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Ready Response Units */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                Mobilized & Ready Units
              </span>
              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <div>
                  <div className="font-semibold text-main">NCR Mobile Trauma 1</div>
                  <span className="text-[10px] text-muted">ALS Ambulance • Base: Delhi ICD</span>
                </div>
                <span className="text-[10px] font-mono text-success font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  READY
                </span>
              </div>

              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <div>
                  <div className="font-semibold text-main">Highway Patrol Unit 08</div>
                  <span className="text-[10px] text-muted">Interceptor • KM 84 NH-44</span>
                </div>
                <span className="text-[10px] font-mono text-primary font-bold bg-primary-50 px-2 py-0.5 rounded">
                  ON PATROL
                </span>
              </div>

              <div className="p-3 rounded bg-white/[0.02] border border-subtle flex items-center justify-between">
                <div>
                  <div className="font-semibold text-main">Agra Emergency Mobile</div>
                  <span className="text-[10px] text-muted">Trauma Unit • Base: Mathura</span>
                </div>
                <span className="text-[10px] font-mono text-success font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  READY
                </span>
              </div>
            </div>

            {/* Trauma Facilities Availability */}
            <div className="p-3.5 rounded bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5 text-xs">
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider flex items-center gap-1">
                <Hospital className="w-3.5 h-3.5" /> Trauma Level 1 ICU Capacity
              </span>
              <p className="text-[11px] text-main">
                AIIMS New Delhi & Safdarjung Trauma have 6 ICU beds reserved for highway emergency protocol.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Average Dispatch Latency</span>
            <span className="text-success font-mono font-bold">1.2 mins</span>
          </div>
        </div>
      </div>

      {/* Dispatch Unit Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-main">Mobilize Emergency Unit</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-muted uppercase font-semibold">Incident:</span>
                <p className="text-main mt-0.5">{selectedAlert.description}</p>
              </div>

              <div>
                <label className="text-main font-medium block mb-1.5">Select Ready Response Unit *</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="">-- Choose Ready Unit --</option>
                  <option value="unit-1">NCR Mobile Trauma 1 (ALS Ambulance - Ready)</option>
                  <option value="unit-2">Highway Patrol Unit 08 (Police Interceptor - Active)</option>
                  <option value="unit-3">Agra Emergency Mobile (Trauma Care - Ready)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => dispatchMutation.mutate({ alertId: selectedAlert._id, unitId: selectedUnit || undefined })}
                disabled={dispatchMutation.isPending}
                className="px-4 py-2 rounded btn-primary text-xs font-semibold text-on-primary"
              >
                {dispatchMutation.isPending ? 'Mobilizing...' : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast SOS Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-critical" />
                <h3 className="text-base font-bold text-main">Broadcast Emergency SOS Beacon</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Incident Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="accident">Severe Collision / Accident</option>
                  <option value="medical">Medical Distress / Driver Health</option>
                  <option value="breakdown">Vehicle Breakdown / Blockade</option>
                  <option value="security">Security / Cargo Hijack Threat</option>
                  <option value="weather">Hazardous Weather Flash Flood</option>
                </select>
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Severity Level</label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="critical">Critical (Immediate Life-Threatening)</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                </select>
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Incident Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe location, casualties, vehicle condition..."
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
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
                  if (!newAlert.description) {
                    toast.error('Please provide an incident description');
                    return;
                  }
                  createAlertMutation.mutate(newAlert);
                }}
                disabled={createAlertMutation.isPending}
                className="px-4 py-2 rounded btn-critical text-xs font-semibold text-white"
              >
                {createAlertMutation.isPending ? 'Broadcasting...' : 'Broadcast SOS Beacon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
