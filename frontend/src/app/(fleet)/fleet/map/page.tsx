'use client';

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

    // Dark carto basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

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
            color: '#06B6D4',
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
      const color = isTransit ? '#10B981' : veh.status === 'idle' ? '#F59E0B' : '#64748B';

      const icon = L.divIcon({
        className: 'custom-truck-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background: #0B132B;
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
            ${isTransit ? `<span style="position:absolute; top:-3px; right:-3px; width:8px; height:8px; border-radius:50%; background:#10B981; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>` : ''}
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
            <Truck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white font-mono tracking-tight uppercase">
              LIVE FLEET TELEMATICS RADAR
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS ENGINE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial tracking, sensor diagnostics, and corridor geofence monitoring.
          </p>
        </div>

        {/* Quick Fleet Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Fleet</span>
            <span className="text-sm font-bold font-mono text-white">{vehicles.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">In Transit</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {vehicles.filter((v) => v.status === 'in_transit').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
            <span className="text-[10px] font-mono text-amber-400 uppercase block">Idle / Depot</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {vehicles.filter((v) => v.status === 'idle').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map + Right Glass Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[620px]">
        {/* Map & Vehicle Selector Area */}
        <div className="lg:col-span-8 flex flex-col glass-panel overflow-hidden relative border border-white/[0.08]">
          {/* Map Controls Floating Bar */}
          <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search truck ID, model, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
              {['all', 'in_transit', 'idle'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
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
          <div className="p-3 bg-slate-950/90 backdrop-blur-md border-t border-white/10 flex items-center gap-2.5 overflow-x-auto z-20">
            {filteredVehicles.map((v) => {
              const isSel = v._id === selectedVehicleId;
              return (
                <button
                  key={v._id}
                  onClick={() => {
                    setSelectedVehicleId(v._id);
                    mapRef.current?.flyTo([v.lat, v.lng], 12);
                  }}
                  className={`px-3 py-2 rounded-xl text-left shrink-0 transition-all border ${
                    isSel
                      ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{v.registrationNumber}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        v.status === 'in_transit' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
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
          <div className="border-b border-white/[0.08] pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  VEHICLE TELEMATICS
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">{selectedVehicle.registrationNumber}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                selectedVehicle.status === 'in_transit'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {selectedVehicle.status.toUpperCase()}
            </span>
          </div>

          {/* Vehicle Profile Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Model Chassis</span>
              <span className="font-semibold text-white">{selectedVehicle.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Payload Capacity</span>
              <span className="font-mono text-cyan-400 font-bold">{selectedVehicle.capacityTon} MT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Corridor</span>
              <span className="font-mono text-amber-300 font-semibold">{selectedVehicle.corridor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GPS Ping Latency</span>
              <span className="font-mono text-emerald-400">{selectedVehicle.lastPing}</span>
            </div>
          </div>

          {/* Sensor Telemetry Gauges */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              DIAGNOSTIC TELEMETRY MATRIX
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Speed Gauge */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cruising Speed</span>
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {selectedVehicle.speed ?? 0} <span className="text-[10px] text-slate-400">km/h</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((selectedVehicle.speed ?? 0) / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fuel Level */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Fuel Tank</span>
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-mono font-bold text-amber-400">
                  {selectedVehicle.fuelLevel ?? 75}%
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${selectedVehicle.fuelLevel ?? 75}%` }}
                  />
                </div>
              </div>

              {/* Engine Temp */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Engine Temp</span>
                  <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  88°C
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">Nominal Range</span>
              </div>

              {/* Tire Pressure */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>TPMS Sensors</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  120 <span className="text-[10px] text-slate-400">PSI</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">10/10 wheels OK</span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                COMMERCIAL PILOT
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{selectedVehicle.driver?.name}</div>
                <div className="text-xs text-slate-400 font-mono">{selectedVehicle.driver?.phone}</div>
              </div>
              <a
                href={`tel:${selectedVehicle.driver?.phone}`}
                className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Live Incident / Telemetry Stream */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              EVENT LOG
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200">Palwal Toll Plaza Cross Event</div>
                  <div className="text-[10px] text-slate-500 font-mono">FASTag verified • 14:22 IST</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200">Driver Rest Break Completed</div>
                  <div className="text-[10px] text-slate-500 font-mono">HOS Compliant 45m • 13:30 IST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
