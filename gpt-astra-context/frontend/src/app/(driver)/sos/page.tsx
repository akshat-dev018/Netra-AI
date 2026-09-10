'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function DriverSOSPage() {
  const [description, setDescription] = useState('');

  const raiseAlert = useMutation({
    mutationFn: (description: string) => client.post('/emergency/alerts', {
      type: 'driver_sos',
      severity: 'critical',
      description,
      triggeredBy: 'driver_sos',
    }),
    onSuccess: () => {
      toast.success('Emergency alert raised');
      setDescription('');
    },
  });

  const reportDisruption = useMutation({
    mutationFn: (description: string) => client.post('/disruptions', {
      type: 'driver_reported',
      severity: 'medium',
      source: 'driver_reported',
      description,
    }),
    onSuccess: () => {
      toast.success('Disruption reported');
      setDescription('');
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">SOS / Report Issue</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="font-semibold mb-2">Emergency Alert (SOS)</h2>
          <p className="text-sm text-gray-500 mb-3">Immediately alerts dispatchers with your current location, shipment, and vehicle.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the emergency..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-critical focus:border-critical min-h-24"
          />
          <button
            onClick={() => raiseAlert.mutate(description)}
            disabled={!description.trim() || raiseAlert.isPending}
            className="mt-3 w-full py-3 bg-critical text-white rounded-lg font-bold hover:bg-opacity-90 transition disabled:opacity-50 touch-target"
          >
            {raiseAlert.isPending ? 'Sending...' : 'RAISE EMERGENCY ALERT'}
          </button>
        </div>
        <div className="border-t pt-6">
          <h2 className="font-semibold mb-2">Report a Disruption</h2>
          <p className="text-sm text-gray-500 mb-3">Road closure, accident witnessed, or weather hazard — for non-emergency reporting.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the disruption..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning focus:border-warning min-h-24"
          />
          <button
            onClick={() => reportDisruption.mutate(description)}
            disabled={!description.trim() || reportDisruption.isPending}
            className="mt-3 w-full py-3 bg-warning text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 touch-target"
          >
            {reportDisruption.isPending ? 'Submitting...' : 'REPORT DISRUPTION'}
          </button>
        </div>
      </div>
    </div>
  );
}
