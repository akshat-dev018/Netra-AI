'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function DriversPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fleet-drivers'],
    queryFn: async () => {
      const res = await client.get('/drivers');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Drivers</h1>
      <div className="space-y-3">
        {data?.map((d: any) => (
          <div key={d._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex justify-between items-center">
            <div>
              <span className="font-semibold">{d.name}</span>
              <span className="text-sm text-gray-500 ml-2">{d.licenseNumber}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${d.status === 'on_trip' ? 'bg-success/20 text-success' : d.status === 'available' ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-600'}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
