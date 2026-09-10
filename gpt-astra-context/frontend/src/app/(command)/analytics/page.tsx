'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await client.get('/analytics/overview');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Analytics</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Fleet Compliance</h2>
        {isLoading ? <div className="h-64 flex items-center justify-center">Loading charts...</div> : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#11315F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
