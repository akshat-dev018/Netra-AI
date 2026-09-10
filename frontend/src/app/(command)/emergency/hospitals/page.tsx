'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function HospitalNetworkPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const res = await client.get('/hospitals');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Hospital Network</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((h: any) => (
            <div key={h._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold">{h.name}</h3>
              <div className="text-sm text-gray-800 mt-2 space-y-1">
                <p>Trauma Level: {h.traumaLevel}</p>
                <p>Capacity: {h.capacityStatus}</p>
                <p>Capabilities: {h.capabilities?.join(', ')}</p>
                {h.contactInfo?.phone && <p>Phone: {h.contactInfo.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
