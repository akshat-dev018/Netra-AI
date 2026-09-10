'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function PredictionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const res = await client.get('/predictions');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Predictions</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map((p: any) => (
            <div key={p._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-2">Corridor {p.corridorId}</h3>
              <div className="text-sm text-gray-800 space-y-1">
                <p>Horizon: {p.horizonHours}h</p>
                <p>Confidence: {p.confidence}%</p>
                <p>Signals: {p.contributingSignals?.length || 0} contributing signals</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
