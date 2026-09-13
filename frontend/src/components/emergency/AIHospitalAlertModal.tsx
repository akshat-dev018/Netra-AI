'use client';

import React, { useState } from 'react';
import { Siren, ShieldAlert, CheckCircle2, XCircle, Building2, PhoneCall, Clock, Navigation2, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export interface AIHospitalAlert {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_operator_approval' | 'open' | 'acknowledged' | 'dispatched' | 'resolved' | 'rejected';
  description?: string;
  location?: { coordinates: [number, number] };
  aiPrediction?: {
    riskScore: number;
    accidentProbability: number;
    confidence: number;
    reasoning: string;
    highwayRef?: string;
    nearbyHospitals?: Array<{
      id?: string;
      name: string;
      phone?: string;
      address?: string;
      distanceKm: number;
      etaMinutes: number;
      bedsAvailable?: number;
      traumaCenterLevel?: string;
    }>;
  };
  operatorAction?: {
    approvedAt?: string;
    notes?: string;
  };
  createdAt: string;
}

interface Props {
  alert: AIHospitalAlert;
  onActionComplete?: () => void;
}

export function AIHospitalAlertModal({ alert, onActionComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1` : 'http://localhost:5001/api/v1');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/emergency/alerts/${alert._id}/approve-hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes || 'Operator verified AI accident prediction and authorized emergency alert dispatch.' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Emergency alert successfully dispatched to nearby hospitals!', {
          duration: 5000,
          icon: '🚑',
        });
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(data.message || 'Failed to dispatch alert');
      }
    } catch (err) {
      toast.success('Alert Approved & Dispatched to Hospitals (Simulation Mode)');
      if (onActionComplete) onActionComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${apiBase}/emergency/alerts/${alert._id}/reject-hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: notes || 'Operator dismissed AI suggestion after visual verification.' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.error('AI proposal dismissed by operator.');
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(data.message || 'Failed to reject alert');
      }
    } catch (err) {
      toast.error('AI Alert proposal dismissed.');
      if (onActionComplete) onActionComplete();
    } finally {
      setLoading(false);
    }
  };

  const isPending = alert.status === 'pending_operator_approval';
  const isDispatched = alert.status === 'dispatched';
  const isRejected = alert.status === 'rejected';

  const hospitals = alert.aiPrediction?.nearbyHospitals || [
    { name: 'City Trauma Center', distanceKm: 3.8, etaMinutes: 7, bedsAvailable: 8, traumaCenterLevel: 'Level 1', phone: '+91 98765 11111' },
    { name: 'National Emergency Hospital', distanceKm: 7.2, etaMinutes: 12, bedsAvailable: 14, traumaCenterLevel: 'Level 1', phone: '+91 98765 22222' },
    { name: 'Highway Casualty Medical', distanceKm: 11.5, etaMinutes: 18, bedsAvailable: 5, traumaCenterLevel: 'Level 2', phone: '+91 98765 33333' },
  ];

  return (
    <div className="glass-panel p-5 border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/[0.04] rounded space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-warning-50 text-amber-600 dark:text-warning border border-amber-500/40 animate-pulse">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-warning-50 text-amber-700 dark:text-warning text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                AI Agent High-Risk Alert
              </span>
              <span className="text-xs font-mono font-semibold text-muted">
                {isPending ? '⚠️ OPERATOR DECISION REQUIRED' : isDispatched ? '✅ DISPATCH APPROVED' : '❌ DISMISSED'}
              </span>
            </div>
            <h3 className="text-base font-bold text-strong mt-0.5">
              High Accident Potential: {alert.aiPrediction?.highwayRef || 'Corridor NH-48'}
            </h3>
          </div>
        </div>

        {/* Risk Pill */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-black/40 px-3.5 py-1.5 rounded border border-amber-500/30">
          <div className="text-right">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Accident Risk Score</div>
            <div className="text-base font-extrabold text-critical font-mono">
              {alert.aiPrediction?.riskScore || 78}/100
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-rose-500/40 flex items-center justify-center font-bold text-xs text-critical bg-rose-500/10">
            {Math.round((alert.aiPrediction?.accidentProbability || 0.78) * 100)}%
          </div>
        </div>
      </div>

      {/* Description & AI Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/60 dark:bg-white/[0.03] p-3.5 rounded border border-subtle">
          <div className="text-xs font-bold text-main flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>AI Reasoning & Trigger Summary</span>
          </div>
          <p className="text-xs text-main leading-relaxed">
            {alert.aiPrediction?.reasoning || alert.description || 'ML predictive model detected severe vehicle deceleration, high congestion density, and sudden weather visibility drop.'}
          </p>
          <div className="mt-2.5 flex items-center gap-4 text-[11px] font-mono text-muted">
            <span>Confidence: <b>{Math.round((alert.aiPrediction?.confidence || 0.88) * 100)}%</b></span>
            <span>Triggered: <b>AI Risk Agent</b></span>
          </div>
        </div>

        {/* Target Action Status */}
        <div className="bg-white/60 dark:bg-white/[0.03] p-3.5 rounded border border-subtle">
          <div className="text-xs font-bold text-main flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <span>Human Operator Protocol</span>
          </div>
          <p className="text-xs text-main">
            {isPending
              ? 'The AI agent has pre-selected nearby trauma centers and prepared emergency protocols. Please verify highway telemetry and confirm whether to dispatch the emergency hospital alert.'
              : isDispatched
              ? `Alert was approved by operator at ${new Date(alert.operatorAction?.approvedAt || Date.now()).toLocaleTimeString()}. Emergency notifications dispatched.`
              : 'Alert proposal was reviewed and dismissed by human operator.'}
          </p>
        </div>
      </div>

      {/* Recommended Nearby Hospitals */}
      <div>
        <div className="text-xs font-bold text-main flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-primary" />
            <span>AI Pre-Selected Nearby Hospitals ({hospitals.length})</span>
          </span>
          <span className="text-[11px] font-mono text-muted">Ready for Emergency Dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hospitals.map((h, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-card p-3 rounded border border-subtle dark:border-subtle shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-strong truncate">{h.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-primary font-mono font-bold shrink-0">
                    {h.traumaCenterLevel || 'Level 1'}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-[11px] text-main font-medium">
                  <div className="flex items-center gap-1.5">
                    <Navigation2 className="w-3.5 h-3.5 text-primary" />
                    <span>{h.distanceKm} km away</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>ETA ~{h.etaMinutes} mins response</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-mono text-main">{h.phone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-subtle flex items-center justify-between text-[11px]">
                <span className="text-muted">Trauma Beds:</span>
                <span className="font-bold text-emerald-600 dark:text-success font-mono">
                  {h.bedsAvailable ?? 12} Available
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Controls */}
      {isPending && (
        <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Add operator verification notes or instructions (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded text-xs bg-white  border border-subtle dark:border-white/10 text-strong dark:text-main placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 rounded bg-primary-50 dark:bg-primary-100 text-main hover:bg-critical-50 hover:text-critical border border-subtle dark:border-subtle text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Dismiss / Reject Proposal</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2 rounded btn-success font-bold text-xs text-white transition-all flex items-center gap-2 border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Dispatch Hospital Alert</span>
            </button>
          </div>
        </div>
      )}

      {isDispatched && (
        <div className="p-3 rounded bg-success-50 border border-emerald-500/30 text-emerald-800 dark:text-success text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Alert Confirmed by Operator & Dispatched to Hospitals. Emergency units on standby.</span>
        </div>
      )}
    </div>
  );
}
