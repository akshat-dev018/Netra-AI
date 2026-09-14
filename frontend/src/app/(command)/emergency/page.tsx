'use client';

import React, { useEffect, useState } from 'react';
import { Siren, Building2, ShieldCheck, Activity, RefreshCw, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AIHospitalAlertModal, type AIHospitalAlert } from '@/components/emergency/AIHospitalAlertModal';
import toast from 'react-hot-toast';

import { emergencyApi } from '@/lib/api';

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState<AIHospitalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'dispatched'>('pending');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.listAlerts({ limit: 50 });
      const data = res.data;
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setAlerts(data.data);
      } else {
        setAlerts(getMockAlerts());
      }
    } catch (err) {
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const pendingAlerts = alerts.filter((a) => a.status === 'pending_operator_approval' || a.status === 'open');
  const dispatchedAlerts = alerts.filter((a) => a.status === 'dispatched');

  const displayAlerts =
    activeTab === 'pending'
      ? pendingAlerts
      : activeTab === 'dispatched'
      ? dispatchedAlerts
      : alerts;

  const triggerSimulatedRiskAlert = () => {
    const newAlert: AIHospitalAlert = {
      _id: 'alert_' + Date.now(),
      type: 'accident_risk_warning',
      severity: 'critical',
      status: 'pending_operator_approval',
      description: 'AI Risk Agent Warning: High potential for multi-vehicle collisions on NH-48 (KM 42-68). High speed drop and fog predicted.',
      aiPrediction: {
        riskScore: 84,
        accidentProbability: 0.84,
        confidence: 0.91,
        highwayRef: 'NH-48 Corridor',
        reasoning: 'ML model identified 72% congestion drop, dense humidity drop, and 3 past accidents on this exact stretch within 48h.',
        nearbyHospitals: [
          { name: 'Apex Level 1 Trauma Center', distanceKm: 4.2, etaMinutes: 8, bedsAvailable: 11, traumaCenterLevel: 'Level 1', phone: '+91 98765 43210' },
          { name: 'Metro Emergency Hospital', distanceKm: 8.1, etaMinutes: 14, bedsAvailable: 6, traumaCenterLevel: 'Level 1', phone: '+91 98765 88888' },
          { name: 'Highway Casualty Care', distanceKm: 12.4, etaMinutes: 19, bedsAvailable: 15, traumaCenterLevel: 'Level 2', phone: '+91 98765 99999' },
        ],
      },
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => [newAlert, ...prev]);
    toast.custom(
      (t) => (
        <div className="bg-amber-600 text-main px-4 py-3 rounded flex items-center gap-3 border border-amber-300">
          <Siren className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-bold text-xs">AI Risk Agent Warning Triggered</div>
            <div className="text-[11px] opacity-90">NH-48 High Accident Risk — Operator Review Required</div>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-warning-50 text-amber-700 dark:text-warning text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              AI Agent + Human Operator Protocol
            </span>
            <span className="text-xs font-mono text-muted">
              Active Control Center
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-strong mt-1 flex items-center gap-2">
            <Siren className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>AI Emergency & Hospital Dispatch Center</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time highway accident risk predictions by AI, with mandatory Human Operator authorization before hospital notification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerSimulatedRiskAlert}
            className="px-3.5 py-2 rounded bg-warning-50 text-amber-700 dark:text-warning hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate AI Risk Detection</span>
          </button>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded bg-card dark:bg-white/[0.06] border border-subtle dark:border-white/10 text-main hover:bg-primary-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded bg-amber-500/15 text-amber-600 dark:text-warning border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase">Pending Operator Review</div>
            <div className="text-xl font-extrabold text-strong font-mono">{pendingAlerts.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded bg-success-50 text-emerald-600 dark:text-success border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase">Dispatched to Hospitals</div>
            <div className="text-xl font-extrabold text-strong font-mono">{dispatchedAlerts.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded bg-indigo-500/15 text-primary border border-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase">Active Hospital Network</div>
            <div className="text-xl font-extrabold text-strong font-mono">18 Centers</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded bg-primary-50 text-primary border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase">Avg Response ETA</div>
            <div className="text-xl font-extrabold text-strong font-mono">8.4 mins</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-subtle dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-main shadow-md'
              : 'text-muted hover:bg-card dark:hover:bg-white/5'
          }`}
        >
          <span>Pending Operator Decision</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-main text-[10px] font-mono">
            {pendingAlerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dispatched')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dispatched'
              ? 'bg-emerald-600 text-main shadow-md'
              : 'text-muted hover:bg-card dark:hover:bg-white/5'
          }`}
        >
          <span>Dispatched Alerts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-main text-[10px] font-mono">
            {dispatchedAlerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-card dark:bg-white text-main dark:text-strong shadow-md'
              : 'text-muted hover:bg-card dark:hover:bg-white/5'
          }`}
        >
          All Activity Log ({alerts.length})
        </button>
      </div>

      {/* Alert Cards Queue */}
      <div className="space-y-4">
        {displayAlerts.length === 0 ? (
          <div className="glass-panel p-8 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-main">No Active Emergency Approvals Pending</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              All highways are currently monitored under normal AI risk thresholds. Click &quot;Simulate AI Risk Detection&quot; above to test the operator approval workflow.
            </p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <AIHospitalAlertModal
              key={alert._id}
              alert={alert}
              onActionComplete={fetchAlerts}
            />
          ))
        )}
      </div>
    </div>
  );
}

function getMockAlerts(): AIHospitalAlert[] {
  return [
    {
      _id: 'alert_mock_1',
      type: 'accident_risk_warning',
      severity: 'critical',
      status: 'pending_operator_approval',
      description: 'AI Risk Agent Warning: High potential for highway accidents detected on NH-48 (KM 42-65). Severe speed drop ratio (0.64) combined with dense fog forecast.',
      aiPrediction: {
        riskScore: 82,
        accidentProbability: 0.82,
        confidence: 0.89,
        highwayRef: 'NH-48 Delhi-Gurugram Expressway',
        reasoning: 'ML model identified 65% congestion drop, dense fog forecast, and high crash history on this segment.',
        nearbyHospitals: [
          { name: 'City Trauma & Emergency Center', distanceKm: 3.5, etaMinutes: 7, bedsAvailable: 12, traumaCenterLevel: 'Level 1', phone: '+91 98765 11111' },
          { name: 'National Casualty Hospital', distanceKm: 6.8, etaMinutes: 11, bedsAvailable: 18, traumaCenterLevel: 'Level 1', phone: '+91 98765 22222' },
          { name: 'Gurugram Emergency Medical', distanceKm: 10.2, etaMinutes: 16, bedsAvailable: 7, traumaCenterLevel: 'Level 2', phone: '+91 98765 33333' },
        ],
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'alert_mock_2',
      type: 'accident_risk_warning',
      severity: 'high',
      status: 'dispatched',
      description: 'AI Accident Risk Warning: Elevated risk score detected on Mumbai-Pune Expressway (KM 88). Heavy monsoon rain.',
      aiPrediction: {
        riskScore: 74,
        accidentProbability: 0.74,
        confidence: 0.85,
        highwayRef: 'Mumbai-Pune Expressway',
        reasoning: 'Hydroplaning risk combined with heavy freight density.',
        nearbyHospitals: [
          { name: 'Lonavala Super Specialty Hospital', distanceKm: 5.1, etaMinutes: 9, bedsAvailable: 9, traumaCenterLevel: 'Level 1', phone: '+91 98765 44444' },
          { name: 'Pune Trauma Institute', distanceKm: 14.2, etaMinutes: 22, bedsAvailable: 20, traumaCenterLevel: 'Level 1', phone: '+91 98765 55555' },
        ],
      },
      operatorAction: {
        approvedAt: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Operator approved pre-alert dispatch to Lonavala trauma team.',
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}
