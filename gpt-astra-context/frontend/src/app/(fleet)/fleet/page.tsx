'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function FleetOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fleet-overview'],
    queryFn: async () => {
      const [vehicles, drivers] = await Promise.all([
        client.get('/vehicles', { params: { page: 1, limit: 100 } }),
        client.get('/drivers', { params: { page: 1, limit: 100 } }),
      ]);
      const vehicleRows = vehicles.data.data ?? [];
      const driverRows = drivers.data.data ?? [];
      return {
        vehicles: {
          active: vehicleRows.filter((v: { status: string }) => v.status === 'active').length,
          idle: vehicleRows.filter((v: { status: string }) => v.status === 'idle').length,
        },
        drivers: {
          onTrip: driverRows.filter((d: { status: string }) => d.status === 'on_trip').length,
          silent: driverRows.filter((d: { lastPingAt?: string }) => d.lastPingAt && Date.now() - Date.parse(d.lastPingAt) > 5 * 60 * 1000).length,
        },
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Fleet Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Active Vehicles</div>
          <div className="text-3xl font-bold">{data?.vehicles?.active || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Drivers On Trip</div>
          <div className="text-3xl font-bold">{data?.drivers?.onTrip || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Idle Vehicles</div>
          <div className="text-3xl font-bold">{data?.vehicles?.idle || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Gone Silent</div>
          <div className="text-3xl font-bold text-critical">{data?.drivers?.silent || 0}</div>
        </div>
      </div>
    </div>
  );
}
