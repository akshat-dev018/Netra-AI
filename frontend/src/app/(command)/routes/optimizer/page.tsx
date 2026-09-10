'use client';

import { useState } from 'react';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function RouteOptimizerPage() {
  const [form, setForm] = useState({ origin: '', destination: '', cargoType: '', priority: 'medium' });
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function optimize(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await client.post('/routes/optimize', form);
      setResult(response.data.data);
    } catch {
      toast.error('Route optimization failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Route Optimizer</h1>
      <form onSubmit={optimize} className="grid gap-4 rounded-xl bg-white p-6 shadow-sm">
        {(['origin', 'destination', 'cargoType'] as const).map((field) => (
          <label key={field} className="grid gap-1 text-sm font-medium capitalize">
            {field.replace(/([A-Z])/g, ' $1')}
            <input required={field !== 'cargoType'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="rounded-lg border px-3 py-2" />
          </label>
        ))}
        <label className="grid gap-1 text-sm font-medium">
          Priority
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="rounded-lg border px-3 py-2">
            <option>low</option><option>medium</option><option>high</option><option>critical</option>
          </select>
        </label>
        <button disabled={loading} className="rounded-lg bg-primary px-4 py-3 font-medium text-white disabled:opacity-50">{loading ? 'Optimizing...' : 'Optimize route'}</button>
      </form>
      {result !== null && <pre className="overflow-auto rounded-xl bg-white p-6 text-sm">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
