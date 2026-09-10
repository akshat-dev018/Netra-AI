'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function NetworkPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['corridors'],
    queryFn: async () => {
      const res = await client.get('/corridors');
      return res.data.data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">National Network</h1>
      {isLoading ? <div className="animate-pulse">Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Corridors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Highway Ref</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Utilization</th>
                  <th className="pb-2">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((c: any) => (
                  <tr key={c._id} className="border-b hover:bg-surface/50">
                    <td className="py-3">{c.name}</td>
                    <td className="py-3">{c.highwayRef}</td>
                    <td className="py-3">{c.type}</td>
                    <td className="py-3">{c.currentUtilization}%</td>
                    <td className="py-3">
                      <span className={c.riskScore > 70 ? 'text-critical font-bold' : c.riskScore > 40 ? 'text-warning font-bold' : 'text-success'}>
                        {c.riskScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
