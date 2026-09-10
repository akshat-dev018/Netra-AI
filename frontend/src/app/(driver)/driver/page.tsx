'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function DriverTripPage() {
  const [started, setStarted] = useState(false);
  const { data: trip } = useQuery({
    queryKey: ['driver-trip'],
    queryFn: async () => (await client.get('/shipments', { params: { page: 1, limit: 1 } })).data.data?.[0] ?? null,
  });
  useEffect(() => setStarted(trip?.status === 'in_transit'), [trip?.status]);

  const updateTrip = useMutation({
    mutationFn: (status: 'in_transit' | 'delivered') => client.patch(`/shipments/${trip?._id}`, { status }),
    onSuccess: () => {
      setStarted((prev) => !prev);
      toast.success('Trip status updated');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">My Trip</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">Shipment {trip?.reference ?? 'No active shipment'}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${started ? 'bg-success text-white' : 'bg-warning text-white'}`}>
            {started ? 'Trip Active' : 'Trip Not Started'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-700">Origin</span><span>{trip?.origin ?? '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-700">Destination</span><span>{trip?.destination ?? '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-700">ETA</span><span>{trip?.eta ? new Date(trip.eta).toLocaleString() : '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-700">Cargo</span><span>{trip?.cargoType ?? '-'}</span></div>
        </div>
        <button
          onClick={() => updateTrip.mutate(started ? 'delivered' : 'in_transit')}
          disabled={updateTrip.isPending || !trip}
          className={`mt-6 w-full py-3 rounded-lg font-medium transition ${started ? 'bg-critical text-white' : 'bg-success text-white'}`}
        >
          {started ? 'End Trip' : 'Start Trip'}
        </button>
      </div>
    </div>
  );
}
