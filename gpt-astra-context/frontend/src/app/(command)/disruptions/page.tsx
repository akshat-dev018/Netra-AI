'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function DisruptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['disruptions'],
    queryFn: async () => {
      const res = await client.get('/disruptions');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Disruptions</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {data?.map((d: any) => (
            <div key={d._id} className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${d.severity === 'critical' ? 'border-l-critical' : d.severity === 'high' ? 'border-l-warning' : 'border-l-primary'}`}>
              <div className="font-semibold">{d.type}</div>
              <p className="text-sm text-gray-600">{d.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded bg-surface text-xs">{d.severity}</span>
                <span className="text-xs px-2 py-1 rounded bg-surface">{d.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
