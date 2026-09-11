'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { corridorsApi, disruptionsApi, hospitalsApi } from '@/lib/api';
import Link from 'next/link';
import {
  Globe,
  Layers,
  AlertTriangle,
  Flame,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Gauge,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export default function NetworkPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layersRef = useRef<{ [key: string]: any }>({});

  const [activeLayer, setActiveLayer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  const { data: corridors, isLoading: corridorsLoading } = useQuery({
    queryKey: ['corridors-network'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  const { data: disruptions, isLoading: disruptionsLoading } = useQuery({
    queryKey: ['disruptions-network'],
    queryFn: async () => {
      const res = await disruptionsApi.list();
      return res.data.data;
    },
  });

  // Prototype sample incidents for full visual fidelity
  const incidentList = [
    {
      id: 'INC-101',
      corridor: 'NH-48',
      title: 'Monsoon Flash Flood & Debris',
      location: 'KM 142 • Jaipur–Kishangarh Expressway',
      severity: 'critical',
      speedDrop: '12 km/h (was 68 km/h)',
      clearance: '~3h 30m',
      affectedTrucks: 84,
      coords: [26.9124, 75.7873],
      action: 'Divert to NH-52 via Ajmer bypass',
    },
    {
      id: 'INC-102',
      corridor: 'NH-44',
      title: 'Toll Plaza System Congestion',
      location: 'KM 68 • Panipat Toll Plaza',
      severity: 'high',
      speedDrop: '18 km/h (was 72 km/h)',
      clearance: '~1h 15m',
      affectedTrucks: 42,
      coords: [29.3909, 76.9635],
      action: 'FASTag lane 4 & 5 switch initiated',
    },
    {
      id: 'INC-103',
      corridor: 'NH-19',
      title: 'Overturned Heavy Consignment',
      location: 'KM 312 • Varanasi Outer Ring Road',
      severity: 'high',
      speedDrop: '24 km/h (was 65 km/h)',
      clearance: '~2h 10m',
      affectedTrucks: 31,
      coords: [25.3176, 82.9739],
      action: 'Crane deployed; single-lane flow open',
    },
    {
      id: 'INC-104',
      corridor: 'NH-27',
      title: 'Bridge Resurfacing Maintenance',
      location: 'KM 88 • Udaipur Connector',
      severity: 'medium',
      speedDrop: '35 km/h (was 80 km/h)',
      clearance: '~5h 00m',
      affectedTrucks: 18,
      coords: [24.5854, 73.7125],
      action: 'Standard contra-flow active',
    },
  ];

  const filteredIncidents = incidentList.filter((inc) => {
    if (!searchQuery) return true;
    return (
      inc.corridor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainer.current || mapInstance.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainer.current || mapInstance.current) return;

      const map = L.map(mapContainer.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([23.5, 78.5], 5.2);

      mapInstance.current = map;

      // Dark CartoDB Voyager tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18, subdomains: 'abcd' }
      ).addTo(map);

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      // National Highway network routes
      const highwayRoutes = [
        {
          code: 'NH-44',
          name: 'Srinagar - Kanyakumari Spine',
          risk: 54,
          pts: [
            [28.6139, 77.209],
            [27.1767, 78.0081],
            [23.2599, 77.4126],
            [21.1458, 79.0882],
            [17.385, 78.4867],
            [12.9716, 77.5946],
          ],
        },
        {
          code: 'NH-48',
          name: 'Delhi - Mumbai - Chennai',
          risk: 76,
          pts: [
            [28.6139, 77.209],
            [26.9124, 75.7873],
            [23.0225, 72.5714],
            [19.076, 72.8777],
            [18.5204, 73.8567],
            [15.3173, 75.7139],
            [13.0827, 80.2707],
          ],
        },
        {
          code: 'NH-19',
          name: 'Delhi - Kolkata Grand Trunk',
          risk: 42,
          pts: [
            [28.6139, 77.209],
            [27.1767, 78.0081],
            [26.8467, 80.9462],
            [25.3176, 82.9739],
            [25.5941, 85.1376],
            [22.5726, 88.3639],
          ],
        },
        {
          code: 'NH-27',
          name: 'Porbandar - Silchar East-West',
          risk: 32,
          pts: [
            [21.6417, 69.6293],
            [24.5854, 73.7125],
            [25.4484, 78.5685],
            [26.1209, 85.3647],
            [26.1445, 91.7362],
          ],
        },
      ];

      // Draw highway lines
      highwayRoutes.forEach((h) => {
        const color = h.risk > 65 ? '#F43F5E' : h.risk > 45 ? '#F59E0B' : '#06B6D4';
        const polyline = L.polyline(h.pts as [number, number][], {
          color,
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);

        polyline.bindPopup(`
          <div style="color: #0F172A; font-family: sans-serif; font-size: 12px; padding: 4px;">
            <b style="font-size: 13px;">${h.code}</b> — ${h.name}<br/>
            <span>Risk Index: <b>${h.risk}/100</b></span>
          </div>
        `);
      });

      // Add Incident Markers
      incidentList.forEach((inc) => {
        const markerBg =
          inc.severity === 'critical'
            ? '#F43F5E'
            : inc.severity === 'high'
            ? '#F59E0B'
            : '#06B6D4';

        const incidentIcon = L.divIcon({
          className: 'custom-incident-icon',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${markerBg}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 14px; height: 14px; border-radius: 50%; background: ${markerBg}; border: 2px solid #FFFFFF; box-shadow: 0 0 12px ${markerBg};"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(inc.coords as [number, number], { icon: incidentIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedIncident(inc);
        });
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
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Network Intelligence Map
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold uppercase">
              14 CORRIDORS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Live national telematics topology, traffic bottlenecks, and real-time hazard layers.
          </p>
        </div>

        {/* Layer Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-card overflow-x-auto">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'corridors', label: 'Corridors' },
            { id: 'incidents', label: 'Incidents (4)' },
            { id: 'weather', label: 'Weather Radar' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLayer === layer.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Left 65% Interactive Map, Right 35% Glass Incidents Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[580px]">
        {/* Map Container (8 cols) */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070B13] flex flex-col">
          <div ref={mapContainer} className="w-full h-full z-0" />

          {/* Floating Map Stats Pill Top Left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs text-white font-mono flex items-center gap-2 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TELEMETRY STREAM ACTIVE • 1,420 TRUCKS PINGING</span>
            </div>
          </div>

          {/* Floating Map Legend Bottom Right */}
          <div className="absolute bottom-4 right-4 z-10 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/[0.1] text-[11px] text-slate-300 space-y-1.5 shadow-2xl pointer-events-none">
            <div className="font-semibold text-white text-[10px] uppercase tracking-wider mb-1">
              Corridor Risk Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Nominal Flow (&gt;65 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Congested / Slowdown (30-65 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Severe Bottleneck / Blocked (&lt;30 km/h)</span>
            </div>
          </div>
        </div>

        {/* Right Glass Panel: Corridor Incidents & Bottlenecks (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded-2xl flex flex-col justify-between overflow-hidden">
          <div className="space-y-3.5 flex-1 flex flex-col overflow-hidden">
            {/* Header & Search */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Incidents & Bottlenecks
                </h2>
                <p className="text-[11px] text-slate-400">Live corridor telemetry triage</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                {incidentList.length} Active
              </span>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search corridor or hotspot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Scrollable Incident Cards List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCrit = inc.severity === 'critical';
                const isHigh = inc.severity === 'high';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs space-y-2.5 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : isCrit
                        ? 'bg-rose-500/10 border-rose-500/25 hover:border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40'
                        : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white text-[11px]">
                        {inc.corridor}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-white text-xs">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{inc.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04] text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Impact Speed</span>
                        <span className="font-mono text-rose-400 font-semibold">{inc.speedDrop}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Est. Clearance</span>
                        <span className="font-mono text-amber-300 font-semibold">{inc.clearance}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                      <span className="text-[10px] text-slate-400">
                        {inc.affectedTrucks} consignments impacted
                      </span>
                      <Link
                        href="/routes/optimizer"
                        className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <span>View Detour</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Card: National Flow Summary */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">National Flow Index</span>
              <span className="text-emerald-400 font-mono font-bold">78% Optimal</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: '78%' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>AVG SPEED: 61 KM/H</span>
              <span>DELAY INDEX: 1.4h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
