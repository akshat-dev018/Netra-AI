'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function AssignmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await client.get('/assignments');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Assignments</h1>
      <div className="space-y-3">
        {data?.map((a: any) => (
          <div key={a._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex justify-between items-center">
            <div>
              <span className="font-semibold">Shipment: {a.shipmentId}</span>
              <span className="text-sm text-gray-500 ml-2">Driver: {a.driverId}</span>
              <span className="text-sm text-gray-500 ml-2">Vehicle: {a.vehicleId}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${a.status === 'active' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
