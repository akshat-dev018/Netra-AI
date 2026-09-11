'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { emergencyApi } from '@/lib/api';
import { AlertOctagon, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AlertRibbon() {
  const [activeAlert, setActiveAlert] = useState<{ id?: string; description?: string; severity?: string; type?: string } | null>(null);

  useEffect(() => {
    // Initial fetch of unacknowledged critical/high alerts
    emergencyApi.listAlerts({ limit: 5 }).then((res) => {
      const urgent = res.data.data?.find((a: any) => a.status === 'open' && (a.severity === 'critical' || a.severity === 'high'));
      if (urgent) {
        setActiveAlert({
          id: urgent._id,
          description: urgent.description,
          severity: urgent.severity,
          type: urgent.type,
        });
      }
    }).catch(() => {});

    try {
      const socket = getSocket('/alerts');
      const onAlert = (payload: any) => {
        if (payload.severity === 'critical' || payload.severity === 'high') {
          setActiveAlert({
            id: payload._id,
            description: payload.description,
            severity: payload.severity,
            type: payload.type,
          });
        }
      };
      socket.on('alert:created', onAlert);
      return () => {
        socket.off('alert:created', onAlert);
      };
    } catch {}
  }, []);

  if (!activeAlert) return null;

  const isCritical = activeAlert.severity === 'critical';

  return (
    <div
      className={`px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 border-b transition-all ${
        isCritical
          ? 'bg-rose-950/80 border-rose-800 text-rose-200'
          : 'bg-amber-950/80 border-amber-800 text-amber-200'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertOctagon className={`w-4 h-4 shrink-0 ${isCritical ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
        <span className="font-bold uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded bg-black/40">
          {activeAlert.severity || 'ALERT'}
        </span>
        <span className="truncate">{activeAlert.description || 'Immediate tactical action required'}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/emergency/alerts"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 font-semibold text-xs transition-colors"
        >
          <span>Respond</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 rounded hover:bg-black/30 text-slate-400 hover:text-white"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
