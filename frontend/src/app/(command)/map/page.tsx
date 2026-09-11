'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { corridorsApi, hospitalsApi, emergencyApi, disruptionsApi, highwaysApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
  Layers,
  MapPin,
  Navigation,
  AlertTriangle,
  Hospital,
  Flame,
  Activity,
  Maximize2,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import L from 'leaflet';

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [layers, setLayers] = useState({
    corridors: true,
    drivers: true,
    hospitals: true,
    alerts: true,
    disruptions: true,
  });

  const [selectedCorridor, setSelectedCorridor] = useState<any | null>(null);
  const [driverLocations, setDriverLocations] = useState<Record<string, any>>({
    'DL01AB1234': { lat: 28.5672, lng: 77.21, speed: 64, driver: 'Demo Driver', reg: 'DL01AB1234' },
  });

  const { data: corridors, isLoading: corridorsLoading } = useQuery({
    queryKey: ['corridors-map'],
    queryFn: async () => {
      const res = await corridorsApi.list();
      return res.data.data;
    },
  });

  const { data: hospitals } = useQuery({
    queryKey: ['hospitals-map'],
    queryFn: async () => {
      const res = await hospitalsApi.list();
      return res.data.data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts-map'],
    queryFn: async () => {
      const res = await emergencyApi.listAlerts();
      return res.data.data;
    },
  });

  const { data: disruptions } = useQuery({
    queryKey: ['disruptions-map'],
    queryFn: async () => {
      const res = await disruptionsApi.list();
      return res.data.data;
    },
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.0, 77.6], 8);

    mapRef.current = map;

    // Dark sleek map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layersRef.current = {
      corridors: L.layerGroup().addTo(map),
      drivers: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      alerts: L.layerGroup().addTo(map),
      disruptions: L.layerGroup().addTo(map),
    };

    // Socket real-time location stream
    try {
      const trackingSocket = getSocket('/tracking');
      trackingSocket.on('driver:location', (data: any) => {
        if (data.driverId && data.lat && data.lng) {
          setDriverLocations((prev) => ({
            ...prev,
            [data.driverId]: {
              lat: data.lat,
              lng: data.lng,
              speed: data.speed || 55,
              driver: data.driverName || 'Driver',
              reg: data.vehicleReg || 'DL01AB1234',
            },
          }));
        }
      });
    } catch {}

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Corridors Layer
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.corridors) return;
    const group = layersRef.current.corridors;
    group.clearLayers();

    if (!layers.corridors || !corridors) return;

    corridors.forEach((c: any) => {
      const coords = c.path?.coordinates || [];
      if (coords.length > 0) {
        // Swap lng, lat to lat, lng for Leaflet
        const latLngs = coords.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
        const risk = c.riskScore || 30;
        const color = risk > 60 ? '#EF4444' : risk > 35 ? '#F59E0B' : '#06B6D4';

        const polyline = L.polyline(latLngs, {
          color,
          weight: 6,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(group);

        polyline.on('click', () => {
          setSelectedCorridor(c);
        });

        polyline.bindTooltip(
          `<b>${c.name}</b><br/>Ref: ${c.highwayRef}<br/>Risk: ${risk}/100<br/>Util: ${c.currentUtilization}%`,
          { className: 'leaflet-dark-tooltip', sticky: true }
        );
      }
    });
  }, [corridors, layers.corridors]);

  // Update Hospitals Layer
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.hospitals) return;
    const group = layersRef.current.hospitals;
    group.clearLayers();

    if (!layers.hospitals || !hospitals) return;

    hospitals.forEach((h: any) => {
      const coords = h.location?.coordinates;
      if (coords) {
        const [lng, lat] = coords;
        const icon = L.divIcon({
          className: 'custom-hospital-icon',
          html: `
            <div style="background:#10B981; border:2px solid #FFFFFF; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(16,185,129,0.5);">
              <span style="color:#FFFFFF; font-size:12px; font-weight:bold;">+</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:160px;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:#06B6D4;">${h.name}</h4>
            <p style="margin:2px 0; font-size:11px;">Trauma Level: <b>Level ${h.traumaLevel || 1}</b></p>
            <p style="margin:2px 0; font-size:11px;">Capacity: <b>${h.capacityStatus || 'Available'}</b></p>
            ${h.contactInfo?.phone ? `<p style="margin:4px 0 0 0; font-size:11px;"><a href="tel:${h.contactInfo.phone}" style="color:#10B981;">📞 ${h.contactInfo.phone}</a></p>` : ''}
          </div>
        `);
      }
    });
  }, [hospitals, layers.hospitals]);

  // Update Disruptions Layer
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.disruptions) return;
    const group = layersRef.current.disruptions;
    group.clearLayers();

    if (!layers.disruptions || !disruptions) return;

    disruptions.forEach((d: any) => {
      const coords = d.location?.coordinates;
      if (coords) {
        const [lng, lat] = coords;
        const icon = L.divIcon({
          className: 'custom-disruption-icon',
          html: `
            <div style="background:#F97316; border:2px solid #FFFFFF; border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(249,115,22,0.6);">
              <span style="color:#FFFFFF; font-size:13px;">⚠️</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:#F97316;">${d.type?.replace('_', ' ').toUpperCase()}</h4>
            <p style="margin:2px 0; font-size:11px;">${d.description}</p>
            <p style="margin:4px 0 0 0; font-size:10px; color:#94A3B8;">Severity: <b>${d.severity}</b></p>
          </div>
        `);
      }
    });
  }, [disruptions, layers.disruptions]);

  // Update Emergency SOS Alerts Layer
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.alerts) return;
    const group = layersRef.current.alerts;
    group.clearLayers();

    if (!layers.alerts || !alerts) return;

    alerts.forEach((a: any) => {
      const coords = a.location?.coordinates || [77.25, 28.5];
      if (coords) {
        const [lng, lat] = coords;
        const icon = L.divIcon({
          className: 'custom-alert-beacon',
          html: `
            <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
              <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(239,68,68,0.4); animation:pulse-ring 1.5s infinite;"></div>
              <div style="background:#EF4444; border:2px solid #FFFFFF; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px #EF4444;">
                <span style="color:#FFFFFF; font-size:10px; font-weight:bold;">SOS</span>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:#EF4444;">🚨 ${a.type?.toUpperCase() || 'EMERGENCY SOS'}</h4>
            <p style="margin:2px 0; font-size:11px;">${a.description}</p>
            <p style="margin:2px 0; font-size:10px; color:#EF4444;">Status: <b>${a.status}</b></p>
            <a href="/emergency/alerts" style="display:inline-block; margin-top:6px; font-size:11px; color:#38BDF8; font-weight:bold;">Open Response Action →</a>
          </div>
        `);
      }
    });
  }, [alerts, layers.alerts]);

  // Update Live Drivers Layer
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.drivers) return;
    const group = layersRef.current.drivers;
    group.clearLayers();

    if (!layers.drivers) return;

    Object.entries(driverLocations).forEach(([id, d]) => {
      const icon = L.divIcon({
        className: 'custom-driver-truck',
        html: `
          <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
            <div style="background:#0F172A; border:2px solid #06B6D4; border-radius:8px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(6,182,212,0.6);">
              <span style="font-size:12px;">🚚</span>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([d.lat, d.lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:160px;">
          <h4 style="font-weight:bold; margin:0 0 4px 0; color:#06B6D4;">${d.reg}</h4>
          <p style="margin:2px 0; font-size:11px;">Driver: <b>${d.driver}</b></p>
          <p style="margin:2px 0; font-size:11px;">Speed: <b>${d.speed} km/h</b></p>
          <span style="display:inline-block; margin-top:4px; padding:2px 6px; border-radius:4px; font-size:9px; background:rgba(16,185,129,0.2); color:#10B981; font-weight:bold;">LIVE TELEMETRY</span>
        </div>
      `);
    });
  }, [driverLocations, layers.drivers]);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const recenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([28.0, 77.6], 8, { duration: 1 });
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col animate-fade-in-up">
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h1 className="text-base font-bold text-white font-sans tracking-tight">
            National Control Map
          </h1>
          <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-semibold">
            TELEMETRY v1.0
          </span>
        </div>

        {/* Multi-Layer Toggle Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <span className="text-slate-400 text-[11px] font-semibold uppercase mr-1 hidden md:inline">Layers:</span>
          <button
            onClick={() => toggleLayer('corridors')}
            className={`px-3 py-1 rounded-xl border transition-all ${
              layers.corridors
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                : 'glass-card text-slate-400'
            }`}
          >
            🛣️ Corridors
          </button>
          <button
            onClick={() => toggleLayer('drivers')}
            className={`px-3 py-1 rounded-xl border transition-all ${
              layers.drivers
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'glass-card text-slate-400'
            }`}
          >
            🚚 Live Drivers
          </button>
          <button
            onClick={() => toggleLayer('alerts')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.alerts
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            🚨 SOS Alerts
          </button>
          <button
            onClick={() => toggleLayer('disruptions')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.disruptions
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            ⚠️ Disruptions
          </button>
          <button
            onClick={() => toggleLayer('hospitals')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.hospitals
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            🏥 Trauma Hubs
          </button>
        </div>

        <button
          onClick={recenter}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all text-xs flex items-center gap-1"
          title="Recenter Map"
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* Main Map View & Inspection Slideover */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapContainer} className="w-full h-full min-h-[480px] z-10" />

        {/* Corridor Telemetry Drawer when clicked */}
        {selectedCorridor && (
          <div className="absolute top-4 left-4 z-20 w-80 bg-[#0E1626]/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  {selectedCorridor.highwayRef || 'CORRIDOR'}
                </span>
                <h3 className="text-xs font-bold text-white leading-snug">{selectedCorridor.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCorridor(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node Endpoints:</span>
                <span className="font-semibold text-slate-200">
                  {selectedCorridor.nodeStart} → {selectedCorridor.nodeEnd}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current Utilization</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedCorridor.currentUtilization}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${selectedCorridor.currentUtilization}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Risk Severity Index</span>
                  <span
                    className={`font-mono font-bold ${
                      selectedCorridor.riskScore > 60
                        ? 'text-rose-400'
                        : selectedCorridor.riskScore > 35
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedCorridor.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedCorridor.riskScore > 60
                        ? 'bg-rose-500'
                        : selectedCorridor.riskScore > 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedCorridor.riskScore}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Congestion</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedCorridor.riskComponents?.congestion ?? 12}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Weather Risk</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {selectedCorridor.riskComponents?.weather ?? 8}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Incidents</span>
                  <span className="font-mono font-semibold text-amber-400">
                    {selectedCorridor.riskComponents?.incidents ?? 8}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Accident Density</span>
                  <span className="font-mono font-semibold text-rose-400">
                    {selectedCorridor.riskComponents?.accidentDensity ?? 10}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
