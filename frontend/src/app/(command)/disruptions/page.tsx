'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disruptionsApi, corridorsApi } from '@/lib/api';
import {
  AlertTriangle,
  Flame,
  Plus,
  Radio,
  MapPin,
  Clock,
  Send,
  X,
  ShieldAlert,
  Zap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DisruptionsPage() {
  const queryClient = useQueryClient();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const [newDisruption, setNewDisruption] = useState({
    type: 'road_closure',
    severity: 'medium',
    description: '',
    affectedCorridorId: '',
    lat: 28.41,
    lng: 77.32,
  });

  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify(
      {
        source: 'traffic_sensor_iot',
        type: 'accident',
        severity: 'high',
        description: 'Multi-vehicle collision blocking 2 lanes near Palwal Toll Plaza',
        location: { type: 'Point', coordinates: [77.35, 28.14] },
      },
      null,
      2
    )
  );

  const { data: disruptions, isLoading } = useQuery({
    queryKey: ['disruptions-list'],
    queryFn: async () => {
      const res = await disruptionsApi.list();
      return res.data.data;
    },
  });

  const { data: corridors } = useQuery({
    queryKey: ['corridors-options'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: typeof newDisruption) => {
      await disruptionsApi.create({
        type: data.type,
        severity: data.severity,
        description: data.description,
        affectedCorridorIds: data.affectedCorridorId ? [data.affectedCorridorId] : [],
        location: {
          type: 'Point',
          coordinates: [data.lng, data.lat],
        },
      });
    },
    onSuccess: () => {
      toast.success('Disruption reported and broadcast to network');
      setShowReportModal(false);
      setNewDisruption({
        type: 'road_closure',
        severity: 'medium',
        description: '',
        affectedCorridorId: '',
        lat: 28.41,
        lng: 77.32,
      });
      queryClient.invalidateQueries({ queryKey: ['disruptions-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to report disruption');
    },
  });

  const webhookMutation = useMutation({
    mutationFn: async (raw: string) => {
      const parsed = JSON.parse(raw);
      await disruptionsApi.sendWebhook(parsed);
    },
    onSuccess: () => {
      toast.success('Sensor webhook ingested successfully!');
      setShowWebhookModal(false);
      queryClient.invalidateQueries({ queryKey: ['disruptions-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Webhook transmission failed');
    },
  });

  // Fallback realistic prototype incidents if DB is clean
  const fallbackList = [
    {
      _id: 'd1',
      type: 'road_closure',
      severity: 'critical',
      description: 'Severe monsoon flooding submerged KM 142 on NH-48 Jaipur–Kishangarh stretch. Complete northbound lane closure.',
      startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      source: 'NHAI Telematics Sensor',
      location: { coordinates: [75.7873, 26.9124] },
    },
    {
      _id: 'd2',
      type: 'accident',
      severity: 'high',
      description: 'Multi-axle container truck collision near Panipat Toll Plaza. 2 out of 4 lanes blocked.',
      startedAt: new Date(Date.now() - 42 * 60000).toISOString(),
      source: 'Highway Patrol Unit 08',
      location: { coordinates: [76.9635, 29.3909] },
    },
    {
      _id: 'd3',
      type: 'severe_weather',
      severity: 'medium',
      description: 'Dense radiation fog reducing visibility below 30m along Agra–Varanasi freight corridor.',
      startedAt: new Date(Date.now() - 85 * 60000).toISOString(),
      source: 'IMD Weather Radar',
      location: { coordinates: [80.9462, 26.8467] },
    },
    {
      _id: 'd4',
      type: 'construction',
      severity: 'low',
      description: 'Overpass resurfacing and lane narrowing on NH-27 KM 88. Speed cap 40 km/h.',
      startedAt: new Date(Date.now() - 140 * 60000).toISOString(),
      source: 'Contractor Scheduled',
      location: { coordinates: [73.7125, 24.5854] },
    },
  ];

  const displayList = disruptions && disruptions.length > 0 ? disruptions : fallbackList;

  const filteredDisruptions = displayList.filter((d: any) => {
    if (filterSeverity === 'all') return true;
    return d.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              Tactical Disruptions & Hazards
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-critical font-mono text-[10px] font-semibold uppercase">
              {displayList.length} ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Active highway bottlenecks, hazardous weather closures, and automated IoT sensor ingestion feeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWebhookModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded glass-card text-xs font-medium text-main hover:text-main hover:border-subtle transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Simulate IoT Webhook</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded btn-critical text-xs font-semibold text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Road Disruption</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Incidents' },
          { key: 'critical', label: 'Critical Closures' },
          { key: 'high', label: 'High Priority' },
          { key: 'medium', label: 'Moderate' },
          { key: 'low', label: 'Minor / Advisory' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterSeverity(tab.key)}
            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all ${
              filterSeverity === tab.key
                ? 'bg-critical-50 text-main border border-rose-500/40 font-semibold shadow-sm'
                : 'glass-card text-muted hover:text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left 65% Incidents Feed, Right 35% Glass Panel IoT & Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDisruptions.map((d: any) => {
              const isCrit = d.severity === 'critical';
              const isHigh = d.severity === 'high';

              return (
                <div
                  key={d._id}
                  className={`p-5 rounded border transition-all flex flex-col justify-between space-y-4 ${
                    isCrit
                      ? 'glass-panel-elevated border-rose-500/40 hover:border-rose-500/60'
                      : isHigh
                      ? 'glass-card border-amber-500/30 hover:border-amber-500/50'
                      : 'glass-card hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isCrit
                            ? 'bg-critical-50 text-critical border border-rose-500/30'
                            : isHigh
                            ? 'bg-warning-50 text-warning border border-amber-500/30'
                            : 'bg-cyan-500/20 text-primary border border-subtle'
                        }`}
                      >
                        {d.severity} SEVERITY
                      </span>

                      <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted" />
                        {d.startedAt ? new Date(d.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-main capitalize">{d.type?.replace('_', ' ')}</h3>
                      <p className="text-xs text-main mt-1 leading-relaxed">{d.description}</p>
                    </div>

                    {d.location?.coordinates && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Lat: {d.location.coordinates[1]}, Lng: {d.location.coordinates[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-muted">
                    <span className="text-[11px]">
                      Source: <b className="text-main">{d.source || 'Manual Dispatch'}</b>
                    </span>
                    <span className="text-success font-semibold font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE ON RADAR
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Glass Panel: Real-time Ingestion Stream (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    IoT Ingestion Gateway
                  </h2>
                  <p className="text-[10px] text-muted font-mono">TELEMETRICS LISTENER</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Quick Webhook Status */}
            <div className="p-3.5 rounded bg-white/[0.02] border border-subtle space-y-2 text-xs">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                Active Telematics Sources
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-main">NHAI FASTag Gantries</span>
                  <span className="text-success font-mono">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-main">IMD Weather Doppler</span>
                  <span className="text-success font-mono">Syncing 5m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-main">Highway Patrol GPS Units</span>
                  <span className="text-primary font-mono">142 Active</span>
                </div>
              </div>
            </div>

            {/* Quick Test Box */}
            <div className="p-3.5 rounded bg-white/[0.03] border border-subtle space-y-2.5 text-xs">
              <span className="text-xs font-semibold text-main block">
                Inject Sensor Incident Test
              </span>
              <p className="text-[11px] text-muted">
                Simulates real-time IoT gantry payload transmission to test automated rerouting.
              </p>
              <button
                onClick={() => webhookMutation.mutate(webhookPayload)}
                disabled={webhookMutation.isPending}
                className="w-full py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-subtle text-primary text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{webhookMutation.isPending ? 'Transmitting...' : 'Dispatch Quick Sensor Event'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Log Tactical Road Disruption</h3>
              <button onClick={() => setShowReportModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Disruption Type</label>
                <select
                  value={newDisruption.type}
                  onChange={(e) => setNewDisruption({ ...newDisruption, type: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="road_closure">Lane / Highway Closure</option>
                  <option value="severe_weather">Severe Weather Flash Flood / Fog</option>
                  <option value="accident">Major Traffic Collision</option>
                  <option value="construction">Highway Construction Works</option>
                  <option value="checkpoint">Security / Toll Checkpoint Delay</option>
                </select>
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Severity Rating</label>
                <select
                  value={newDisruption.severity}
                  onChange={(e) => setNewDisruption({ ...newDisruption, severity: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="low">Low (Minor Speed Drop)</option>
                  <option value="medium">Medium (Moderate Delays)</option>
                  <option value="high">High (Major Bottleneck)</option>
                  <option value="critical">Critical (Complete Roadblock)</option>
                </select>
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Incident Summary *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Lane closure near Faridabad bypass due to road maintenance"
                  value={newDisruption.description}
                  onChange={(e) => setNewDisruption({ ...newDisruption, description: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Affected Freight Corridor</label>
                <select
                  value={newDisruption.affectedCorridorId}
                  onChange={(e) => setNewDisruption({ ...newDisruption, affectedCorridorId: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="">-- Select Affected Corridor (Optional) --</option>
                  {corridors?.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.highwayRef}: {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newDisruption.description) {
                    toast.error('Please enter disruption description');
                    return;
                  }
                  reportMutation.mutate(newDisruption);
                }}
                disabled={reportMutation.isPending}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-main text-xs font-semibold "
              >
                {reportMutation.isPending ? 'Publishing...' : 'Publish Disruption'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Simulate External IoT Sensor Webhook</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-muted">
                Transmits a JSON payload directly to <code className="text-primary font-mono">/api/v1/webhooks/disruptions</code>:
              </p>
              <textarea
                rows={8}
                value={webhookPayload}
                onChange={(e) => setWebhookPayload(e.target.value)}
                className="glass-input w-full p-3 rounded text-primary font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => webhookMutation.mutate(webhookPayload)}
                disabled={webhookMutation.isPending}
                className="px-4 py-2 rounded btn-primary text-on-primary text-main text-xs font-semibold "
              >
                {webhookMutation.isPending ? 'Transmitting...' : 'Post Webhook Payload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
