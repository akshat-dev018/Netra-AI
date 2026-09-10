'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function ResponseMonitoringPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['response-units'],
    queryFn: async () => {
      const res = await client.get('/emergency/response-units');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Response Monitoring</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Response Units</h2>
          <div className="space-y-3">
            {data?.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="font-medium">{u.name}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${u.status === 'active' ? 'bg-success/20 text-success' : 'bg-gray-200 text-gray-800'}`}>{u.status}</span>
                </div>
                <span className="text-sm text-gray-700">Type: {u.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
