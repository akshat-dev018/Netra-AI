'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import { useAuth } from '@/auth/AuthProvider';

export default function DriverProfilePage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: async () => {
      const res = await client.get('/users/me');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">My Profile</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><div className="text-sm text-gray-500">Name</div><p className="font-medium">{data?.name || user?.name}</p></div>
          <div><div className="text-sm text-gray-500">License</div><p className="font-medium">{data?.licenseNumber || '-'}</p></div>
          <div><div className="text-sm text-gray-500">Phone</div><p className="font-medium">{data?.phone || user?.email}</p></div>
          <div><div className="text-sm text-gray-500">Status</div><p className="font-medium">{data?.status || '—'}</p></div>
        </div>
      </div>
    </div>
  );
}
