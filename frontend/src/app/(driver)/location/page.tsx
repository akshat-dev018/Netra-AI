'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function LocationPage() {
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState<GeoJSON.Point | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!sharing) return;
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GeoJSON.Point = {
          type: 'Point',
          coordinates: [pos.coords.longitude, pos.coords.latitude],
        };
        setLocation(point);
        client.post('/tracking/ping', {
          location: point,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        }).catch(() => toast.error('Failed to send location'));
      },
      (err) => toast.error(err.message),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
    );
    setWatchId(watchId);

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [sharing]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Share My Location</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Location Sharing</h2>
            <p className="text-sm text-gray-700 mt-1">Shares your location with fleet managers while a trip is active. Stops automatically when trip ends or you toggle off.</p>
          </div>
          <button
            onClick={() => setSharing((prev) => !prev)}
            className={`touch-target w-16 h-9 rounded-full transition-all relative ${sharing ? 'bg-success' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow transition-all ${sharing ? 'translate-x-7' : ''}`} />
          </button>
        </div>
        {location && (
          <div className="bg-surface rounded-lg p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Last ping:</span>
              <span>{location.coordinates[1].toFixed(5)}, {location.coordinates[0].toFixed(5)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
