'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function AccidentRiskPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['accidents'],
    queryFn: async () => {
      const res = await client.get('/risk/accidents');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Accident Risk</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Historical &amp; Predictive Accident Risk</h2>
          <div className="space-y-4">
            {data?.map((a: any) => (
              <div key={a._id} className="border-b pb-4">
                <div className="flex justify-between">
                  <span className="font-medium">{a.corridorId}</span>
                  <span className="text-critical font-bold">Risk: {a.score}/100</span>
                </div>
                <p className="text-sm text-gray-600">Threshold: {a.threshold} · Confidence: {a.confidence}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
