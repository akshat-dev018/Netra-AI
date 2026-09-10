'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshClient } from '@/lib/api/refreshClient';
import { tokenStore } from '@/auth/tokenStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await refreshClient.post('/auth/register', { name, email, password, role });
      tokenStore.set(data.data.accessToken);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Create Account</h1>
        <p className="text-gray-700 mb-6">Register for NETRA</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Password (min 8)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="driver">Driver</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="controller">Controller</option>
              <option value="ops_manager">Ops Manager</option>
              <option value="analyst">Analyst</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
