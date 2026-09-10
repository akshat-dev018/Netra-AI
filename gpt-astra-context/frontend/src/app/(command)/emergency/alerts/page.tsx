'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function EmergencyAlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['emergency-alerts'],
    queryFn: async () => {
      const res = await client.get('/emergency/alerts');
      return res.data.data;
    },
    staleTime: 15_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Emergency Alerts</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {data?.map((a: any) => (
            <div key={a._id} className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${a.severity === 'critical' ? 'border-l-critical' : a.severity === 'high' ? 'border-l-warning' : 'border-l-primary'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{a.type} — {a.severity}</div>
                  <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-surface">{a.status}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 text-sm bg-warning text-white rounded">Acknowledge</button>
                <button className="px-3 py-1 text-sm bg-critical text-white rounded">Dispatch</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
