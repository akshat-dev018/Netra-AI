'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { emergencyApi } from '@/lib/api';
import { AlertOctagon, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AlertRibbon() {
  const [activeAlert, setActiveAlert] = useState<{ id?: string; description?: string; severity?: string; type?: string } | null>(null);

  useEffect(() => {
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
      className={`px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 border-b ${
        isCritical
          ? 'bg-critical-50 border-critical text-critical'
          : 'bg-warning-50 border-warning text-warning'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertOctagon className="w-4 h-4 shrink-0" />
        <span className="font-bold uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded-sm border border-current/30">
          {activeAlert.severity || 'ALERT'}
        </span>
        <span className="truncate">{activeAlert.description || 'Immediate tactical action required'}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/emergency/alerts"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-sm font-semibold text-xs ${
            isCritical ? 'bg-critical text-white' : 'bg-warning text-white'
          }`}
        >
          <span>Respond</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 rounded hover:bg-black/10"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
