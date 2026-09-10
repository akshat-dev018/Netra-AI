'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

interface KPI {
  activeShipments: number;
  shipmentsAtRisk: number;
  openDisruptions: number;
  activeEmergencyAlerts: number;
  driversLive: number;
  networkRiskIndex: number;
}

export default function DashboardPage() {

  const { data, isLoading } = useQuery<KPI>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await client.get('/analytics/overview');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const kpis = [
    { label: 'Active Shipments', value: data?.activeShipments ?? 0, color: 'bg-[#11315F]/10 text-[#11315F]' },
    { label: 'Shipments At Risk', value: data?.shipmentsAtRisk ?? 0, color: 'bg-red-100 text-[#991b1b]' },
    { label: 'Open Disruptions', value: data?.openDisruptions ?? 0, color: 'bg-orange-100 text-[#9a3412]' },
    { label: 'Active Emergency Alerts', value: data?.activeEmergencyAlerts ?? 0, color: 'bg-red-100 text-[#991b1b]' },
    { label: 'Drivers Live', value: data?.driversLive ?? 0, color: 'bg-green-100 text-[#166534]' },
    { label: 'Network Risk Index', value: data?.networkRiskIndex ?? 0, color: data?.networkRiskIndex && data.networkRiskIndex > 70 ? 'bg-red-100 text-[#991b1b]' : 'bg-orange-100 text-[#9a3412]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.color} rounded-xl p-6 shadow-sm border border-[#11315F]/10`}>
            <div className="text-sm opacity-80">{kpi.label}</div>
            <div className="text-3xl font-bold mt-2">{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/map" className="p-4 border rounded-lg hover:bg-surface transition text-center">Live Map</a>
          <a href="/shipments" className="p-4 border rounded-lg hover:bg-surface transition text-center">Shipments</a>
          <a href="/emergency/alerts" className="p-4 border rounded-lg hover:bg-surface transition text-center">Emergency Alerts</a>
          <a href="/reports" className="p-4 border rounded-lg hover:bg-surface transition text-center">Reports</a>
        </div>
      </div>
    </div>
  );
}
