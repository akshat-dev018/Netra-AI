'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function CorridorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['corridors-detail'],
    queryFn: async () => {
      const res = await client.get('/corridors');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Corridor Intelligence</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((c: any) => (
          <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-2">{c.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Highway: {c.highwayRef}</p>
              <p>Type: {c.type}</p>
              <p>Utilization: {c.currentUtilization}%</p>
              <p>Risk Score: {c.riskScore}/100</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
