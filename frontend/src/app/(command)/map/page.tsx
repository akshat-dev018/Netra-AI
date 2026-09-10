'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { client } from '@/lib/api/client';

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = L.map(mapContainer.current, { zoomControl: true });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    map.setView([20.5937, 78.9629], 5);

    const cleanup = () => {
      map.remove();
      mapRef.current = null;
    };
    return cleanup;
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Live Map</h1>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-700">Layers:</span>
        <span className="px-2 py-1 rounded bg-[#11315F]/10 text-[#11315F] text-xs">Highways</span>
        <span className="px-2 py-1 rounded bg-orange-100 text-[#9a3412] text-xs">Corridor Risk</span>
        <span className="px-2 py-1 rounded bg-green-100 text-[#166534] text-xs">Drivers</span>
        <span className="px-2 py-1 rounded bg-red-100 text-[#991b1b] text-xs">Alerts</span>
        <span className="px-2 py-1 rounded bg-[#11315F]/10 text-[#11315F] text-xs">Hospitals</span>
      </div>
      <div ref={mapContainer} className="h-[600px] rounded-xl border border-gray-300 shadow-sm" />
    </div>
  );
}
