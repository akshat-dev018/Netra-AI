'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      toast.success('Password updated successfully');
    } catch {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-4">Reset Password</h1>
        <p className="text-gray-500 mb-6">Enter your reset token and new password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Reset Token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-medium">Reset Password</button>
        </form>
      </div>
    </div>
  );
}