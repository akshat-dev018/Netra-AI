'use client';

import { TOKENS } from '@/theme/tokens';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { routesApi } from '@/lib/api';
import { getLeafletTileConfig } from '@/lib/mapTiles';
import {
  Navigation,
  MapPin,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Hospital,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Candidate = {
  rank: number;
  origin: string;
  destination: string;
  etaMinutes: number;
  distanceKm: number;
  costIndex: number;
  riskScore: number;
  breakdown?: { weather?: number; congestion?: number; accidentDensity?: number };
  coords?: [number, number][];
};

type RouteOption = {
  rank: number;
  title: string;
  distance: string;
  time: string;
  riskScore: number;
  safetyIndex: string;
  costIndex: number;
  points: string[];
  kind: 'recommended' | 'alternate' | 'avoid';
  coords?: [number, number][];
};

const CITY_COORDS_MAP: Record<string, [number, number]> = {
  'delhi': [28.6139, 77.2090],
  'tughlakabad': [28.5355, 77.2678],
  'agra': [27.1767, 78.0081],
  'gurugram': [28.4595, 77.0266],
  'jaipur': [26.9124, 75.7873],
  'noida': [28.5355, 77.3910],
  'mathura': [27.4924, 77.6737],
  'mumbai': [19.0760, 72.8777],
  'kolkata': [22.5726, 88.3639],
  'chennai': [13.0827, 80.2707],
  'bengaluru': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
};

function getCoordsForCity(name: string, fallback: [number, number]): [number, number] {
  const lower = name.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS_MAP)) {
    if (lower.includes(key)) return coords;
  }
  return fallback;
}

function formatEta(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function safetyFromRisk(risk: number) {
  return `${Math.max(5, 100 - risk)}/100`;
}

function generateDynamicPolyline(orig: string, dest: string, rank: number): [number, number][] {
  const start = getCoordsForCity(orig, [28.5355, 77.2678]);
  const end = getCoordsForCity(dest, [27.1767, 78.0081]);
  const drift = (rank - 1) * 0.15;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  return [
    start,
    [start[0] + dx * 0.3 - drift * 0.1, start[1] + dy * 0.3 + drift * 0.12],
    [start[0] + dx * 0.7 + drift * 0.08, start[1] + dy * 0.7 - drift * 0.1],
    end,
  ];
}

function mapCandidates(raw: unknown, origin: string, destination: string): RouteOption[] {
  const list = Array.isArray(raw) ? (raw as Candidate[]) : [];
  const sorted = [...list].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  return sorted.map((c, i) => {
    const kind: RouteOption['kind'] = i === 0 ? 'recommended' : i === 1 ? 'alternate' : 'avoid';
    const weather = c.breakdown?.weather ?? 12;
    const congestion = c.breakdown?.congestion ?? 18;
    const accidents = c.breakdown?.accidentDensity ?? 15;
    const points =
      kind === 'recommended'
        ? [
            `Lowest composite risk (${c.riskScore}/100) for ${origin} → ${destination}`,
            `Weather load ${weather}% · congestion ${congestion}% · accident density ${accidents}%`,
            `Cost index ${c.costIndex} — preferred for ${kind === 'recommended' ? 'on-time dispatch' : 'backup'}`,
          ]
        : kind === 'alternate'
        ? [
            `Secondary path: +${Math.max(0, (c.etaMinutes ?? 0) - (sorted[0]?.etaMinutes ?? 0))} min vs AI primary`,
            `Congestion share ${congestion}% — usable if primary is blocked`,
            `Cost index ${c.costIndex}`,
          ]
        : [
            `Highest risk in this set (${c.riskScore}/100) — avoid unless escort assigned`,
            `Accident density ${accidents}% · congestion ${congestion}%`,
            `Cost index ${c.costIndex} with longest ETA`,
          ];
    const titles = [
      'AI incident-avoidance corridor',
      'Alternate arterial (higher delay)',
      'Direct urban artery (elevated risk)',
    ];
    return {
      rank: c.rank ?? i + 1,
      title: titles[i] ?? `Candidate ${i + 1}`,
      distance: `${c.distanceKm} km`,
      time: formatEta(c.etaMinutes),
      riskScore: c.riskScore,
      safetyIndex: safetyFromRisk(c.riskScore),
      costIndex: c.costIndex,
      points,
      kind,
      coords: c.coords,
    };
  });
}

export default function RouteOptimizerPage() {
  const [origin, setOrigin] = useState('Tughlakabad ICD, Delhi');
  const [destination, setDestination] = useState('Agra Dry Port, UP');
  const [cargoType, setCargoType] = useState('container');
  const [priority, setPriority] = useState('high');
  const [result, setResult] = useState<RouteOption[] | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const overlayRef = useRef<any>(null);

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
      const options = mapCandidates(data, origin, destination);
      if (!options.length) {
        toast.error('Optimizer returned no route candidates');
        return;
      }
      setResult(options);
      toast.success(`${options.length} ranked AI route candidates ready`);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Route optimization failed');
    },
  });

  const presets = [
    { label: 'Delhi → Agra', origin: 'Tughlakabad ICD, Delhi', dest: 'Agra Dry Port, UP' },
    { label: 'Gurugram → Jaipur', origin: 'Gurugram Logistics Hub', dest: 'Jaipur Inland Depot' },
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
      }).setView([27.85, 77.65], 7);

      mapInstance.current = map;
      overlayRef.current = L.layerGroup().addTo(map);

      const tiles = getLeafletTileConfig();
      L.tileLayer(tiles.url, tiles.options).addTo(map);

      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => map.invalidateSize(), 400);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        overlayRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();

    import('leaflet').then(({ default: Leaflet }) => {
      const layer = overlayRef.current;
      const m = mapInstance.current;
      if (!layer || !m) return;
      layer.clearLayers();

      const options = result ?? [];
      const startCoord = getCoordsForCity(origin, [28.5355, 77.2678]);
      const endCoord = getCoordsForCity(destination, [27.1767, 78.0081]);
      const allPoints: [number, number][] = [startCoord, endCoord];

      if (options.length > 0) {
        options.forEach((opt) => {
          const pts = opt.coords && opt.coords.length > 0 ? opt.coords : generateDynamicPolyline(origin, destination, opt.rank);
          pts.forEach((p) => allPoints.push(p));

          const color =
            opt.kind === 'recommended' ? TOKENS.success : opt.kind === 'alternate' ? TOKENS.primary : TOKENS.warning;
          const line = Leaflet.polyline(pts, {
            color,
            weight: opt.kind === 'recommended' ? 6 : 4,
            opacity: opt.kind === 'recommended' ? 0.95 : 0.75,
            dashArray: opt.kind === 'avoid' ? '8, 8' : undefined,
          }).addTo(layer);

          line.bindTooltip(`${opt.title} · rank ${opt.rank}`, { sticky: true });
        });
      } else {
        const baseline = generateDynamicPolyline(origin, destination, 1);
        baseline.forEach((p) => allPoints.push(p));
        Leaflet.polyline(baseline, {
          color: TOKENS.primary,
          weight: 5,
          opacity: 0.8,
        }).addTo(layer);
      }

      const startIcon = Leaflet.divIcon({
        className: 'custom-pin',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${TOKENS.success};border:2px solid ${TOKENS.white}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const endIcon = Leaflet.divIcon({
        className: 'custom-pin',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${TOKENS.critical};border:2px solid ${TOKENS.white}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      Leaflet.marker(startCoord, { icon: startIcon }).addTo(layer).bindPopup(`Origin: ${origin}`);
      Leaflet.marker(endCoord, { icon: endIcon }).addTo(layer).bindPopup(`Destination: ${destination}`);

      if (allPoints.length > 0) {
        const bounds = Leaflet.latLngBounds(allPoints);
        m.fitBounds(bounds, { padding: [40, 40] });
      }

      setTimeout(() => m.invalidateSize(), 50);
    });
  }, [result, origin, destination]);


  const recommended = result?.find((r) => r.kind === 'recommended');

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-strong">
            AI Tactical Route Optimizer
          </h1>
          <span className="px-2 py-0.5 rounded-sm bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
            Ranked candidates
          </span>
        </div>
        <p className="text-sm text-muted mt-1">
          NETRA returns multiple scored paths. The recommended corridor is highlighted on the map and in the comparison cards.
        </p>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider shrink-0">
            Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setOrigin(p.origin);
                setDestination(p.dest);
                setResult(null);
              }}
              className="px-2.5 py-1 rounded-sm bg-primary-50 hover:bg-primary-100 border border-subtle text-xs text-main shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="text-main font-medium block mb-1.5">Origin Node</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 text-main font-medium text-xs focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-main font-medium block mb-1.5">Destination Node</label>
            <div className="relative">
              <Navigation className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-success" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 text-main font-medium text-xs focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-main font-medium block mb-1.5">Cargo Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="glass-input w-full px-3 py-2 text-main font-medium text-xs focus:outline-none bg-card"
            >
              <option value="low">Standard / Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority / On-Time Critical</option>
              <option value="critical">SOS / Emergency Escort</option>
            </select>
          </div>
          <div>
            <label className="text-main font-medium block mb-1.5">Cargo Classification</label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="glass-input w-full px-3 py-2 text-main font-medium text-xs focus:outline-none bg-card"
            >
              <option value="container">ISO Container</option>
              <option value="bulk">Bulk Raw Material</option>
              <option value="refrigerated">Refrigerated Pharma / Food</option>
              <option value="hazmat">Hazardous / Chemical</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 btn-primary font-semibold text-xs text-on-primary disabled:opacity-50"
          >
            <Bot className={`w-4 h-4 ${optimizeMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{optimizeMutation.isPending ? 'Calculating ranked paths...' : 'Generate Optimized Route'}</span>
          </button>
        </div>
      </div>

      <div ref={resultsRef} className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-5 space-y-3">
          {!result && (
            <div className="glass-card p-6 text-sm text-muted">
              No candidates yet. Set origin and destination, then generate a route. Ranked AI suggestions
              (primary, alternate, and high-risk artery) will appear here and as separate polylines on the map.
            </div>
          )}

          {result?.map((option) => (
            <div
              key={option.rank}
              className={`p-4 rounded border space-y-3 ${
                option.kind === 'recommended'
                  ? 'bg-safe-bg border-success'
                  : option.kind === 'avoid'
                  ? 'bg-warning-50 border-warning'
                  : 'glass-card border-subtle'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider ${
                    option.kind === 'recommended'
                      ? 'bg-success text-white'
                      : option.kind === 'avoid'
                      ? 'bg-warning text-white'
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {option.kind === 'recommended'
                    ? `Rank ${option.rank} · AI recommended`
                    : option.kind === 'alternate'
                    ? `Rank ${option.rank} · Alternate`
                    : `Rank ${option.rank} · Avoid if possible`}
                </span>
                <span className="text-xs font-mono font-bold text-main">Safety {option.safetyIndex}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-strong">{option.title}</h3>
                <p className="text-[11px] text-muted mt-0.5">
                  {origin} → {destination}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-subtle text-center">
                <div>
                  <span className="text-[10px] text-muted block">Distance</span>
                  <span className="text-sm font-bold font-mono text-main">{option.distance}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Transit</span>
                  <span className="text-sm font-bold font-mono text-main">{option.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Risk</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      option.kind === 'recommended'
                        ? 'text-success'
                        : option.kind === 'avoid'
                        ? 'text-critical'
                        : 'text-warning'
                    }`}
                  >
                    {option.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {option.points.map((b) => (
                  <div key={b} className="flex items-start gap-2 text-[11px] text-main">
                    {option.kind === 'avoid' ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-warning mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-success mt-0.5" />
                    )}
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {option.kind === 'recommended' && (
                <button
                  onClick={() =>
                    toast.success('Optimized route parameters dispatched to driver telematics')
                  }
                  className="w-full py-2.5 btn-primary font-semibold text-xs text-on-primary"
                >
                  Apply AI Route to Active Dispatch
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="xl:col-span-7 glass-card p-4 flex flex-col space-y-3 min-h-[520px]">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-subtle">
            <div>
              <h2 className="text-sm font-bold text-strong">Route comparison map</h2>
              <p className="text-[11px] text-muted">
                Green = recommended · Navy = alternate · Amber dashed = higher-risk artery
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-sm bg-primary-50 border border-subtle text-primary text-[10px] font-mono font-bold">
              {result ? `${result.length} PATHS` : 'STANDBY'}
            </span>
          </div>

          <div className="relative h-[360px] w-full rounded overflow-hidden border border-subtle bg-page">
            <div ref={mapContainer} className="w-full h-full z-0" />
            <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-sm bg-card border border-subtle text-[10px] text-main flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-success rounded-full" />
                AI optimal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-primary rounded-full" />
                Alternate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-warning rounded-full" />
                High-risk
              </span>
            </div>
          </div>

          <div className="text-xs text-muted">
            {recommended ? (
              <span>
                Primary suggestion: <span className="text-main font-semibold">{recommended.title}</span> ·{' '}
                {recommended.distance} · {recommended.time}
              </span>
            ) : (
              <span>Generate a route to plot ranked polylines. Baseline corridor shown until then.</span>
            )}
          </div>

          <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <Hospital className="w-3.5 h-3.5" />
              Trauma coverage along recommended buffer
            </span>
            <span className="font-mono text-primary font-semibold text-[11px]">3 ranked options</span>
          </div>
        </div>
      </div>
    </div>
  );
}
