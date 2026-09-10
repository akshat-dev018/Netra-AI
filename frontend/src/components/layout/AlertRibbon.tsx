'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export function AlertRibbon() {
  const [alert, setAlert] = useState<{ description?: string; severity?: string } | null>(null);

  useEffect(() => {
    const socket = getSocket('/alerts');
    const onAlert = (payload: { severity?: string; description?: string }) => {
      if (payload.severity === 'critical') setAlert(payload);
    };
    socket.on('alert:created', onAlert);
    return () => {
      socket.off('alert:created', onAlert);
    };
  }, []);

  if (!alert) return null;
  return (
    <div className="critical-pattern bg-critical px-4 py-2 text-sm font-semibold text-white" role="alert">
      Critical alert: {alert.description ?? 'Immediate response required'}
    </div>
  );
}
