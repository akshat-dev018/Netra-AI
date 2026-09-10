'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { useAuth } from '@/auth/AuthProvider';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: '', password: '' });
  const { user } = useAuth();
  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await client.get('/users', { params: { page: 1, limit: 100 } })).data,
    enabled: activeTab === 'users' && user?.role === 'admin',
  });
  const sources = useQuery({
    queryKey: ['data-sources'],
    queryFn: async () => (await client.get('/settings/data-sources')).data,
    enabled: activeTab === 'data-sources' && user?.role === 'admin',
  });
  const audit = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => (await client.get('/audit-log')).data,
    enabled: activeTab === 'audit-log' && user?.role === 'admin',
  });

  const update = useMutation({
    mutationFn: (body: object) => client.patch('/users/me', body),
    onSuccess: () => toast.success('Profile updated'),
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      <div className="flex gap-2 border-b">
        {['profile', 'users', 'data-sources', 'audit-log'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            {tab.replace(/-/g, ' ')}
          </button>
        ))}
      </div>
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">New Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <button onClick={() => update.mutate(form)} disabled={update.isPending} className="px-6 py-2 bg-primary text-white rounded-lg font-medium">
            Save Changes
          </button>
        </div>
      )}
      {activeTab !== 'profile' && user?.role !== 'admin' && (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-600">Admin access is required for this section.</div>
      )}
      {activeTab === 'users' && user?.role === 'admin' && <pre className="overflow-auto rounded-xl bg-white p-6 text-sm">{JSON.stringify(users.data?.data ?? [], null, 2)}</pre>}
      {activeTab === 'data-sources' && user?.role === 'admin' && <pre className="overflow-auto rounded-xl bg-white p-6 text-sm">{JSON.stringify(sources.data?.data ?? [], null, 2)}</pre>}
      {activeTab === 'audit-log' && user?.role === 'admin' && <pre className="overflow-auto rounded-xl bg-white p-6 text-sm">{JSON.stringify(audit.data?.data ?? [], null, 2)}</pre>}
    </div>
  );
}
