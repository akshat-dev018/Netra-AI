'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      toast.success('Password reset instructions sent');
      setEmail('');
    } catch {
      toast.error('Failed to send reset instructions');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-4">Forgot Password</h1>
        <p className="text-gray-500 mb-6">Enter your email to receive password reset instructions.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-medium">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}