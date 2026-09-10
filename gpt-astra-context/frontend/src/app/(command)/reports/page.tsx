'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await client.get('/reports');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Reports</h1>
      {isLoading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Generated Reports</h2>
          <div className="space-y-3">
            {data?.map((r: any) => (
              <div key={r._id} className="border-b pb-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{r.type}</span>
                  <span className="text-sm text-gray-500 ml-2">{r.format?.toUpperCase()}</span>
                </div>
                <button
                  className="px-3 py-1 text-sm bg-primary text-white rounded"
                  onClick={async () => {
                    const response = await client.get(`/reports/${r._id}/export`, { responseType: 'blob' });
                    const url = URL.createObjectURL(response.data);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = `${r.type ?? 'report'}.${r.format ?? 'csv'}`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
