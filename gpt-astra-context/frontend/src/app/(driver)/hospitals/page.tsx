'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface Hospital {
  id: string;
  name: string;
  distanceKm: number;
  traumaLevel: number;
  capabilities: string[];
  contactInfo?: { phone?: string };
}

export default function DriverHospitalsPage() {
  const [coordinates, setCoordinates] = useState({ lat: 19.076, lng: 72.8777 });
  const [useCurrent, setUseCurrent] = useState(false);

  const { data, isLoading } = useQuery<Hospital[]>({
    queryKey: ['nearby-hospitals', coordinates, useCurrent],
    queryFn: async () => {
      const res = await client.get('/hospitals/nearby', {
        params: {
          lat: useCurrent ? undefined : coordinates.lat,
          lng: useCurrent ? undefined : coordinates.lng,
          radius: 50,
        },
      });
      return res.data.data;
    },
    enabled: !useCurrent,
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Nearby Hospitals</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Rank hospitals by distance & trauma capability from your current position.</div>
          <button
            onClick={() => {
              if (!navigator.geolocation) {
                toast.error('Geolocation is not supported by this browser');
                return;
              }
              navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                  setCoordinates({ lat: coords.latitude, lng: coords.longitude });
                  setUseCurrent(true);
                },
                ({ message }) => toast.error(message),
                { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
              );
            }}
            className="text-sm bg-primary text-white px-4 py-2 rounded"
          >
            Use Current Location
          </button>
        </div>
        <div className="space-y-3">
          {data?.map((h) => (
            <div key={h.id} className="border-b pb-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{h.name}</span>
                <span className="text-sm text-gray-500">{h.distanceKm.toFixed(1)} km</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Trauma Level: {h.traumaLevel} · Capabilities: {h.capabilities.join(', ')}</div>
              {h.contactInfo?.phone && <button className="text-sm text-primary underline mt-2">Call {h.contactInfo.phone}</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
