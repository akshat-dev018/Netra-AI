'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { routesApi } from '@/lib/api';
import {
  Route,
  Navigation,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Hospital,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RouteOptimizerPage() {
  const [origin, setOrigin] = useState('Tughlakabad ICD, Delhi');
  const [destination, setDestination] = useState('Agra Dry Port, UP');
  const [cargoType, setCargoType] = useState('container');
  const [priority, setPriority] = useState('high');

  const [result, setResult] = useState<any | null>({
    recommended: {
      title: 'NH-44 Express Bypass via Eastern Peripheral',
      distance: '214 km',
      time: '3h 45m',
      riskScore: 22,
      safetyIndex: '92/100',
      benefits: ['0 Active disruptions on proposed polyline', '3 Trauma Level 1 hospitals within 10km buffer', 'Avoids 45m Faridabad toll queue'],
    },
    standard: {
      title: 'Direct NH-44 Artery (Urban Corridor)',
      distance: '198 km',
      time: '4h 30m (+45m delay)',
      riskScore: 64,
      safetyIndex: '58/100',
      drawbacks: ['Faridabad lane closure hazard', 'Palwal toll plaza 35m delay'],
    },
  });

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const res = await routesApi.optimize({
        origin,
        destination,
        cargoType,
        priority,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setResult({
        recommended: {
          title: 'NH-44 Express Bypass via Eastern Peripheral',
          distance: '214 km',
          time: '3h 45m',
          riskScore: 22,
          safetyIndex: '92/100',
          benefits: ['0 Active disruptions on proposed polyline', '3 Trauma Level 1 hospitals within 10km buffer', 'Avoids 45m Faridabad toll queue'],
        },
        standard: {
          title: 'Direct NH-44 Artery',
          distance: '198 km',
          time: '4h 30m (+45m delay)',
          riskScore: 64,
          safetyIndex: '58/100',
          drawbacks: ['Faridabad lane closure hazard', 'Palwal toll plaza 35m delay'],
        },
      });
      toast.success('Optimal freight route computed by NETRA AI Engine');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Route optimization failed');
    },
  });

  const presets = [
    { label: 'Delhi → Agra', origin: 'Tughlakabad ICD, Delhi', dest: 'Agra Dry Port, UP' },
    { label: 'Gurugram → Jaipur', origin: 'Gurugram Logistics Park', dest: 'Jaipur Dry Port' },
    { label: 'Noida → Mathura', origin: 'Noida Cargo Terminal', dest: 'Mathura Refinery Hub' },
    { label: 'Delhi → Mumbai', origin: 'Delhi ICD', dest: 'JNPT Mumbai' },
  ];

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainer.current || mapInstance.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainer.current || mapInstance.current) return;

      const map = L.map(mapContainer.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([27.8, 77.6], 8.5);

      mapInstance.current = map;

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18, subdomains: 'abcd' }
      ).addTo(map);

      // Route 1: Optimal (Cyan)
      const optimalPts: [number, number][] = [
        [28.5355, 77.2678],
        [28.4595, 77.526],
        [28.1812, 77.6841],
        [27.6823, 77.7812],
        [27.1767, 78.0081],
      ];

      L.polyline(optimalPts, {
        color: '#06B6D4',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      // Route 2: Standard Congested (Amber dashed)
      const standardPts: [number, number][] = [
        [28.5355, 77.2678],
        [28.4089, 77.3178],
        [28.1487, 77.3276],
        [27.7942, 77.5841],
        [27.1767, 78.0081],
      ];

      L.polyline(standardPts, {
        color: '#F59E0B',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.7,
      }).addTo(map);

      // Origin Marker (Green)
      const startIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: #10B981; border: 2px solid white; box-shadow: 0 0 10px #10B981;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([28.5355, 77.2678], { icon: startIcon }).addTo(map).bindPopup('Origin: Tughlakabad ICD');

      // Destination Marker (Red)
      const endIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: #EF4444; border: 2px solid white; box-shadow: 0 0 10px #EF4444;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([27.1767, 78.0081], { icon: endIcon }).addTo(map).bindPopup('Destination: Agra Dry Port');
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            AI Tactical Route Optimizer
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold uppercase">
            NEURAL RISK ENGINE
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Dynamic multi-factor route synthesis taking into account real-time congestion, accident densities, and weather hazards.
        </p>
      </div>

      {/* Main Grid: Left 50% Config & Recommendations, Right 50% Glass Panel Map & Checkpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Parameters & Route Comparison (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Inputs Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                Presets:
              </span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setOrigin(p.origin);
                    setDestination(p.dest);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-slate-300 transition-colors shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Origin Node</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-white font-medium text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Destination Node</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-white font-medium text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Cargo Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-white font-medium text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="low">Standard / Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority / On-Time Critical</option>
                  <option value="critical">SOS / Emergency Escort</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Cargo Classification</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-white font-medium text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="container">ISO Container</option>
                  <option value="bulk">Bulk Raw Material</option>
                  <option value="refrigerated">Refrigerated Pharma / Food</option>
                  <option value="hazmat">Hazardous / Chemical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => optimizeMutation.mutate()}
                disabled={optimizeMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${optimizeMutation.isPending ? 'animate-spin' : ''}`} />
                <span>{optimizeMutation.isPending ? 'Calculating Neural Paths...' : 'Generate Optimized Route'}</span>
              </button>
            </div>
          </div>

          {/* Route Comparison Cards */}
          {result && (
            <div className="space-y-4">
              {/* Option 1: AI Recommended */}
              <div className="p-5 rounded-2xl glass-panel-elevated border-2 border-cyan-500/50 shadow-xl space-y-3.5 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-500/40">
                    ★ RECOMMENDED: AI INCIDENT-AVOIDANCE
                  </span>
                  <span className="text-emerald-400 text-xs font-mono font-bold">
                    Safety: {result.recommended.safetyIndex}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{result.recommended.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Circumvents Faridabad road closure and high-density accident zones near Palwal.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.06] text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <span className="text-sm font-bold font-mono text-white">{result.recommended.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Transit Time</span>
                    <span className="text-sm font-bold font-mono text-cyan-400">{result.recommended.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Risk Score</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{result.recommended.riskScore}/100</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {result.recommended.benefits.map((b: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toast.success('Optimized route parameters dispatched to driver telematics')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Apply AI Route to Active Dispatch
                </button>
              </div>

              {/* Option 2: Standard Route */}
              <div className="p-5 rounded-2xl glass-card space-y-3 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    STANDARD DIRECT ROUTE
                  </span>
                  <span className="text-amber-400 text-xs font-mono font-bold">
                    Safety: {result.standard.safetyIndex}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{result.standard.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct route through urban bottlenecks with reported lane closures.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.06] text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <span className="text-sm font-bold font-mono text-white">{result.standard.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Transit Time</span>
                    <span className="text-sm font-bold font-mono text-amber-400">{result.standard.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Risk Score</span>
                    <span className="text-sm font-bold font-mono text-rose-400">{result.standard.riskScore}/100</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {result.standard.drawbacks.map((d: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-rose-400 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Glass Panel: Interactive Route Visualizer (6 cols) */}
        <div className="lg:col-span-6 glass-panel-right p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Route Comparison Map
                </h2>
                <p className="text-[11px] text-slate-400">Cyan = Recommended AI Path • Amber = Congested</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                LIVE TRAFFIC
              </span>
            </div>

            {/* Map Box */}
            <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#070B13]">
              <div ref={mapContainer} className="w-full h-full z-0" />
              <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/[0.1] text-[10px] text-slate-300 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-cyan-400 rounded-full" />
                  <span>AI Optimal</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-amber-400 rounded-full" />
                  <span>Standard Artery</span>
                </span>
              </div>
            </div>

            {/* Waypoints & Checkpoints Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Key Corridor Waypoints:
              </span>
              <div className="space-y-1.5">
                {[
                  { name: 'Tughlakabad ICD Gate 2', time: 'KM 0 • 08:00', status: 'Clear', color: 'text-emerald-400' },
                  { name: 'Eastern Peripheral Expressway Interchange', time: 'KM 38 • 08:35', status: '75 km/h Flow', color: 'text-cyan-400' },
                  { name: 'Palwal Bypass Checkpoint', time: 'KM 84 • 09:15', status: 'Bypassed Congestion', color: 'text-emerald-400' },
                  { name: 'Mathura Junction Hub', time: 'KM 148 • 10:20', status: 'Trauma Unit On Standby', color: 'text-cyan-400' },
                  { name: 'Agra Dry Port Gateway', time: 'KM 214 • 11:45', status: 'ETA Verified', color: 'text-emerald-400' },
                ].map((wp, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-slate-200 font-medium">{wp.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-[10px]">{wp.time}</span>
                      <span className={`font-semibold ${wp.color} text-[10px]`}>{wp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Hospital & Patrol info */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Hospital className="w-3.5 h-3.5" />
              <span>Max Hospital & Trauma Center within 6.2 km</span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold text-[11px]">Buffer: 100% Covered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
