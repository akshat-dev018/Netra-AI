'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function ShipmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const res = await client.get('/shipments');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Shipments</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Origin</th>
                  <th className="pb-2">Destination</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">ETA</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((s: any) => (
                  <tr key={s._id} className="border-b hover:bg-surface/50">
                    <td className="py-3">{s.reference}</td>
                    <td className="py-3">{s.origin}</td>
                    <td className="py-3">{s.destination}</td>
                    <td className="py-3">{s.status}</td>
                    <td className="py-3">{s.riskScore}</td>
                    <td className="py-3">{s.eta ? new Date(s.eta).toLocaleDateString() : '-'}</td>
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
