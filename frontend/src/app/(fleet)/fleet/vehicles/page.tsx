'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function VehiclesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await client.get('/vehicles');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Vehicles</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-700">
              <th className="pb-2">Registration</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Assigned Driver</th>
              <th className="pb-2">Maintenance Due</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((v: any) => (
              <tr key={v._id} className="border-b hover:bg-surface/50">
                <td className="py-3">{v.registrationNumber}</td>
                <td className="py-3">{v.type}</td>
                <td className="py-3">{v.status}</td>
                <td className="py-3">{v.assignedDriverId}</td>
                <td className="py-3">{v.maintenanceDueAt ? new Date(v.maintenanceDueAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
