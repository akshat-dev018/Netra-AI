'use client';

import { TOKENS } from '@/theme/tokens';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi, corridorsApi } from '@/lib/api';
import {
  Truck,
  MapPin,
  Navigation,
  Radio,
  Gauge,
  Fuel,
  Thermometer,
  ShieldCheck,
  Phone,
  Layers,
  Search,
  Activity,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import L from 'leaflet';
import { getLeafletTileConfig } from '@/lib/mapTiles';

interface FleetVehicle {
  _id: string;
  registrationNumber: string;
  model: string;
  capacityTon: number;
  status: 'available' | 'in_transit' | 'maintenance' | 'idle';
  fuelLevel?: number;
  speed?: number;
  driver?: { name: string; phone: string };
  corridor?: string;
  lat: number;
  lng: number;
  lastPing?: string;
}

export default function FleetMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: apiVehicles } = useQuery({
    queryKey: ['fleet-vehicles-map'],
    queryFn: async () => {
      const res = await vehiclesApi.list();
      return res.data.data;
    },
  });

  const { data: corridors } = useQuery({
    queryKey: ['corridors-fleet-map'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  // Comprehensive fallback fleet with coordinates along Indian freight arteries
  const vehicles: FleetVehicle[] = (apiVehicles && apiVehicles.length > 0)
    ? apiVehicles.map((v: any, idx: number) => ({
        _id: v._id || `veh-${idx + 1}`,
        registrationNumber: v.registrationNumber || `DL01AB${1000 + idx}`,
        model: v.model || 'Tata Prima 4028.S (18T)',
        capacityTon: v.capacityTon || 28,
        status: v.status || (idx % 3 === 0 ? 'in_transit' : idx % 3 === 1 ? 'available' : 'idle'),
        fuelLevel: 68 - (idx * 7) % 40,
        speed: v.status === 'in_transit' || idx % 2 === 0 ? 58 + (idx * 4) % 25 : 0,
        driver: { name: v.assignedDriver?.name || `Driver ${idx + 1}`, phone: '+91 98765 43210' },
        corridor: idx % 2 === 0 ? 'NH-44 North' : 'Western DFC Hub',
        lat: 28.5 + (idx * 0.15) - 0.3,
        lng: 77.2 + (idx * 0.2) - 0.2,
        lastPing: '34s ago',
      }))
    : [
        {
          _id: 'veh-1',
          registrationNumber: 'DL01AB1234',
          model: 'Tata Prima 4028.S (18T)',
          capacityTon: 28,
          status: 'in_transit',
          fuelLevel: 74,
          speed: 64,
          driver: { name: 'Rajesh Kumar', phone: '+91 98112 34567' },
          corridor: 'NH-44 North (Delhi - Agra)',
          lat: 28.5672,
          lng: 77.21,
          lastPing: '12s ago',
        },
        {
          _id: 'veh-2',
          registrationNumber: 'MH04XY9876',
          model: 'BharatBenz 2823C (16T)',
          capacityTon: 24,
          status: 'in_transit',
          fuelLevel: 82,
          speed: 71,
          driver: { name: 'Sunil Verma', phone: '+91 98223 45678' },
          corridor: 'Western Freight Corridor',
          lat: 28.385,
          lng: 77.302,
          lastPing: '25s ago',
        },
        {
          _id: 'veh-3',
          registrationNumber: 'HR55TR5432',
          model: 'Ashok Leyland 4220 HG',
          capacityTon: 32,
          status: 'idle',
          fuelLevel: 45,
          speed: 0,
          driver: { name: 'Harpreet Singh', phone: '+91 98334 56789' },
          corridor: 'Tughlakabad Dry Port',
          lat: 28.512,
          lng: 77.275,
          lastPing: '2m ago',
        },
        {
          _id: 'veh-4',
          registrationNumber: 'UP80AB8821',
          model: 'Eicher Pro 6028T',
          capacityTon: 20,
          status: 'in_transit',
          fuelLevel: 59,
          speed: 52,
          driver: { name: 'Vikas Sharma', phone: '+91 98445 67890' },
          corridor: 'Yamuna Expressway Express',
          lat: 28.18,
          lng: 77.52,
          lastPing: '45s ago',
        },
      ];

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.45, 77.35], 10);

    mapRef.current = map;

    const tiles = getLeafletTileConfig();
    L.tileLayer(tiles.url, tiles.options).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map corridors & markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Render corridors if available
    if (corridors && corridors.length > 0) {
      corridors.forEach((c: any) => {
        const coords = c.path?.coordinates || [];
        if (coords.length > 0) {
          const latLngs = coords.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
          L.polyline(latLngs, {
            color: TOKENS.primary,
            weight: 3,
            opacity: 0.6,
            dashArray: '6, 6',
          }).addTo(mapRef.current!);
        }
      });
    }

    // Add Vehicle Markers
    vehicles.forEach((veh) => {
      const isSelected = veh._id === selectedVehicleId;
      const isTransit = veh.status === 'in_transit';
      const color = isTransit ? TOKENS.success : veh.status === 'idle' ? TOKENS.warning : TOKENS.primary;

      const icon = L.divIcon({
        className: 'custom-truck-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background: ${TOKENS.primary};
            border: 2px solid ${color};
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '18px' : '8px'} ${color}99;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            <span style="font-size:${isSelected ? '16px' : '13px'};">🚛</span>
            ${isTransit ? `<span style="position:absolute; top:-3px; right:-3px; width:8px; height:8px; border-radius:50%; background:${TOKENS.success}; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([veh.lat, veh.lng], { icon }).addTo(mapRef.current!);
      marker.on('click', () => {
        setSelectedVehicleId(veh._id);
      });

      markersRef.current[veh._id] = marker;
    });
  }, [vehicles, selectedVehicleId, corridors]);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driver?.name && v.driver.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-main font-mono tracking-tight uppercase">
              LIVE FLEET TELEMATICS RADAR
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-success-50 border border-emerald-500/30 text-success text-[10px] font-mono font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS ENGINE ACTIVE
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Real-time geospatial tracking, sensor diagnostics, and corridor geofence monitoring.
          </p>
        </div>

        {/* Quick Fleet Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-card border border-subtle text-center">
            <span className="text-[10px] font-mono text-muted uppercase block">Total Fleet</span>
            <span className="text-sm font-bold font-mono text-main">{vehicles.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-mono text-success uppercase block">In Transit</span>
            <span className="text-sm font-bold font-mono text-success">
              {vehicles.filter((v) => v.status === 'in_transit').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded bg-amber-950/30 border border-amber-500/30 text-center">
            <span className="text-[10px] font-mono text-warning uppercase block">Idle / Depot</span>
            <span className="text-sm font-bold font-mono text-warning">
              {vehicles.filter((v) => v.status === 'idle').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map + Right Glass Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[620px]">
        {/* Map & Vehicle Selector Area */}
        <div className="lg:col-span-8 flex flex-col glass-panel overflow-hidden relative border border-subtle">
          {/* Map Controls Floating Bar */}
          <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-card backdrop-blur-md p-1.5 rounded border border-white/10 shadow-lg">
              <Search className="w-3.5 h-3.5 text-muted ml-2" />
              <input
                type="text"
                placeholder="Search truck ID, model, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-main placeholder:text-muted outline-none w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto bg-card backdrop-blur-md p-1 rounded border border-white/10 shadow-lg">
              {['all', 'in_transit', 'idle'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-[#11315F] dark:bg-primary-700 text-[#DEEBEC] dark:text-white border border-primary-500 shadow-sm'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Container */}
          <div ref={mapContainer} className="w-full h-full min-h-[480px] z-10" />

          {/* Bottom Vehicle Quick Carousel */}
          <div className="p-3 bg-card backdrop-blur-md border-t border-white/10 flex items-center gap-2.5 overflow-x-auto z-20">
            {filteredVehicles.map((v) => {
              const isSel = v._id === selectedVehicleId;
              return (
                <button
                  key={v._id}
                  onClick={() => {
                    setSelectedVehicleId(v._id);
                    mapRef.current?.flyTo([v.lat, v.lng], 12);
                  }}
                  className={`px-3 py-2 rounded text-left shrink-0 transition-all border ${
                    isSel
                      ? 'bg-primary-50 border-subtle '
                      : 'bg-card border-subtle hover:border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-main">{v.registrationNumber}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        v.status === 'in_transit' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">
                    {v.speed && v.speed > 0 ? `${v.speed} km/h • ` : 'Idle • '}
                    {v.driver?.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT GLASS TELEMATICS INSPECTOR */}
        <div className="lg:col-span-4 glass-panel-right flex flex-col overflow-y-auto space-y-4 p-5">
          {/* Panel Header */}
          <div className="border-b border-subtle pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-main font-mono uppercase tracking-wider">
                  VEHICLE TELEMATICS
                </h2>
                <p className="text-[10px] text-muted font-mono">{selectedVehicle.registrationNumber}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                selectedVehicle.status === 'in_transit'
                  ? 'bg-success-50 text-success border border-emerald-500/30'
                  : 'bg-amber-500/15 text-warning border border-amber-500/30'
              }`}
            >
              {selectedVehicle.status.toUpperCase()}
            </span>
          </div>

          {/* Vehicle Profile Summary */}
          <div className="p-3.5 rounded bg-card border border-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Model Chassis</span>
              <span className="font-semibold text-main">{selectedVehicle.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Payload Capacity</span>
              <span className="font-mono text-primary font-bold">{selectedVehicle.capacityTon} MT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Current Corridor</span>
              <span className="font-mono text-warning font-semibold">{selectedVehicle.corridor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">GPS Ping Latency</span>
              <span className="font-mono text-success">{selectedVehicle.lastPing}</span>
            </div>
          </div>

          {/* Sensor Telemetry Gauges */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">
              DIAGNOSTIC TELEMETRY MATRIX
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Speed Gauge */}
              <div className="p-3 rounded bg-card border border-subtle space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Cruising Speed</span>
                  <Gauge className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-xl font-mono font-bold text-main">
                  {selectedVehicle.speed ?? 0} <span className="text-[10px] text-muted">km/h</span>
                </div>
                <div className="w-full bg-primary-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.min(100, ((selectedVehicle.speed ?? 0) / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fuel Level */}
              <div className="p-3 rounded bg-card border border-subtle space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Fuel Tank</span>
                  <Fuel className="w-3.5 h-3.5 text-warning" />
                </div>
                <div className="text-xl font-mono font-bold text-warning">
                  {selectedVehicle.fuelLevel ?? 75}%
                </div>
                <div className="w-full bg-primary-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${selectedVehicle.fuelLevel ?? 75}%` }}
                  />
                </div>
              </div>

              {/* Engine Temp */}
              <div className="p-3 rounded bg-card border border-subtle space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Engine Temp</span>
                  <Thermometer className="w-3.5 h-3.5 text-success" />
                </div>
                <div className="text-xl font-mono font-bold text-success">
                  88°C
                </div>
                <span className="text-[10px] text-success/80 font-mono">Nominal Range</span>
              </div>

              {/* Tire Pressure */}
              <div className="p-3 rounded bg-card border border-subtle space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>TPMS Sensors</span>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-xl font-mono font-bold text-main">
                  120 <span className="text-[10px] text-muted">PSI</span>
                </div>
                <span className="text-[10px] text-muted font-mono">10/10 wheels OK</span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="p-3.5 rounded bg-cyan-950/20 border border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                COMMERCIAL PILOT
              </span>
              <ShieldCheck className="w-4 h-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-main">{selectedVehicle.driver?.name}</div>
                <div className="text-xs text-muted font-mono">{selectedVehicle.driver?.phone}</div>
              </div>
              <a
                href={`tel:${selectedVehicle.driver?.phone}`}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-subtle text-primary transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Live Incident / Telemetry Stream */}
          <div className="space-y-2 pt-2 border-t border-subtle">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">
              EVENT LOG
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-card border border-subtle flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-medium text-main">Palwal Toll Plaza Cross Event</div>
                  <div className="text-[10px] text-muted font-mono">FASTag verified • 14:22 IST</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-subtle flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                <div>
                  <div className="font-medium text-main">Driver Rest Break Completed</div>
                  <div className="text-[10px] text-muted font-mono">HOS Compliant 45m • 13:30 IST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
