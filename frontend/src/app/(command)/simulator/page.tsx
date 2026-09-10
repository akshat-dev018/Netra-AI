'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function SimulatorPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['simulator-scenarios'],
    queryFn: async () => {
      const res = await client.get('/simulator/scenarios');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">What-If Simulator</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Simulation Scenarios</h2>
        {isLoading ? <div className="animate-pulse h-24 flex items-center justify-center">Loading scenarios...</div> : (
          <div className="space-y-3">
            {data?.map((s: any) => (
              <div key={s._id} className="border-b pb-3">
                <div className="font-medium">{s.name}</div>
                <p className="text-sm text-gray-800">{s.resultSummary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}