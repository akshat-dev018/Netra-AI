'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import { useColorblind } from '@/contexts/providers/ColorblindProvider';

interface KPI {
  activeShipments: number;
  shipmentsAtRisk: number;
  openDisruptions: number;
  activeEmergencyAlerts: number;
  driversLive: number;
  networkRiskIndex: number;
}

export default function DashboardPage() {
  const { isColorblindMode } = useColorblind();

  const { data, isLoading } = useQuery<KPI>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await client.get('/analytics/overview');
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const kpis = [
    { label: 'Active Shipments', value: data?.activeShipments ?? 0, color: isColorblindMode ? 'bg-primary' : 'bg-primary' },
    { label: 'Shipments At Risk', value: data?.shipmentsAtRisk ?? 0, color: 'bg-critical' },
    { label: 'Open Disruptions', value: data?.openDisruptions ?? 0, color: 'bg-warning' },
    { label: 'Active Emergency Alerts', value: data?.activeEmergencyAlerts ?? 0, color: 'bg-critical' },
    { label: 'Drivers Live', value: data?.driversLive ?? 0, color: 'bg-success' },
    { label: 'Network Risk Index', value: data?.networkRiskIndex ?? 0, color: data?.networkRiskIndex && data.networkRiskIndex > 70 ? 'bg-critical' : 'bg-warning' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.color} text-white rounded-xl p-6 shadow-lg`}>
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
