'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function FleetMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = L.map(mapContainer.current);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    map.setView([20.5937, 78.9629], 6);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Live Fleet Map</h1>
      <div ref={mapContainer} className="h-[600px] rounded-xl border border-gray-300 shadow-sm" />
    </div>
  );
}
