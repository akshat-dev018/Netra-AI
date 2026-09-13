'use client';

import { TOKENS } from '@/theme/tokens';
import { getLeafletTileConfig } from '@/lib/mapTiles';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Maximize2, ShieldAlert } from 'lucide-react';

interface MiniRiskMapProps {
  corridors?: any[];
  alerts?: any[];
}

export default function MiniRiskMap({ corridors, alerts }: MiniRiskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainer.current || mapInstance.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainer.current || mapInstance.current) return;

      const map = L.map(mapContainer.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
      }).setView([22.5, 78.9], 5);

      mapInstance.current = map;

      const tiles = getLeafletTileConfig();
      L.tileLayer(tiles.url, tiles.options).addTo(map);

      // Render default corridors if not provided or empty
      const corridorData = corridors && corridors.length > 0 ? corridors : [
        {
          code: 'NH-44',
          name: 'Delhi - Mumbai',
          riskScore: 68,
          coords: [
            [28.6139, 77.209],
            [26.9124, 75.7873],
            [23.2599, 77.4126],
            [19.076, 72.8777],
          ],
        },
        {
          code: 'NH-48',
          name: 'Delhi - Chennai',
          riskScore: 42,
          coords: [
            [28.6139, 77.209],
            [27.1767, 78.0081],
            [17.385, 78.4867],
            [13.0827, 80.2707],
          ],
        },
        {
          code: 'NH-19',
          name: 'Delhi - Kolkata',
          riskScore: 78,
          coords: [
            [28.6139, 77.209],
            [26.8467, 80.9462],
            [25.5941, 85.1376],
            [22.5726, 88.3639],
          ],
        },
      ];

      corridorData.forEach((c) => {
        let latLngs: [number, number][] = [];
        if (c.path?.coordinates) {
          latLngs = c.path.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
        } else if (c.coords) {
          latLngs = c.coords;
        }

        if (latLngs.length > 1) {
          const color =
            c.riskScore > 65
              ? TOKENS.critical // rose
              : c.riskScore > 40
              ? TOKENS.warning // amber
              : TOKENS.primary; // cyan

          L.polyline(latLngs, {
            color,
            weight: 4,
            opacity: 0.85,
            smoothFactor: 1.5,
          }).addTo(map);

          // Add pulsing point at midpoint
          const mid = latLngs[Math.floor(latLngs.length / 2)];
          const pulseIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker(mid, { icon: pulseIcon }).addTo(map);
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [corridors]);

  return (
    <div className="relative w-full h-[260px] rounded overflow-hidden border border-subtle bg-page">
      <div ref={mapContainer} className="w-full h-full z-0" />

      {/* Glass Overlay Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="map-overlay px-2.5 py-1 rounded-md text-[10px] font-mono font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
          NATIONAL RADAR
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <Link
          href="/network"
          className="map-overlay p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
          title="Open Full Network Map"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bottom Legend */}
      <div className="map-overlay absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success shadow-sm shadow-cyan-400/50" />
            <span>Low Risk (&lt;40)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span>Moderate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>Severe Hazard</span>
          </span>
        </div>
        <span className="font-mono font-semibold text-[10px]">14 Corridors Active</span>
      </div>
    </div>
  );
}
