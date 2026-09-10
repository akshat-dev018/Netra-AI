'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function RiskPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['risk-corridors'],
    queryFn: async () => {
      const res = await client.get('/risk/corridors');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Risk Monitoring</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Corridor Risk Breakdown</h2>
          <div className="space-y-3">
            {data?.map((r: any) => (
              <div key={r._id} className="border-b pb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{r.name || r.corridorId}</span>
                  <span className={r.riskScore > 70 ? 'text-critical font-bold' : r.riskScore > 40 ? 'text-warning font-bold' : 'text-success'}>
                    {r.riskScore}/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className={`h-full rounded-full ${r.riskScore > 70 ? 'bg-critical' : r.riskScore > 40 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${r.riskScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
