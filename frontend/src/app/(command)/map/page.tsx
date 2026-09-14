'use client';

import { TOKENS } from '@/theme/tokens';
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
import { getLeafletTileConfig } from '@/lib/mapTiles';

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
  const [selectedRegion, setSelectedRegion] = useState('Delhi–Agra Spine (NH-44)');

  const REGIONS: Record<string, { center: [number, number]; zoom: number }> = {
    'Delhi–Agra Spine (NH-44)': { center: [27.85, 77.65], zoom: 8 },
    'Delhi–Mumbai Arc (NH-48)': { center: [23.5, 75.0], zoom: 6 },
    'Delhi–Kolkata Trunk (NH-19)': { center: [25.5, 83.0], zoom: 6 },
    'Mumbai–Pune Corridor': { center: [18.8, 73.3], zoom: 9 },
    'Bengaluru–Chennai Arc': { center: [13.0, 78.8], zoom: 8 },
    'National Overview (India)': { center: [22.5, 78.5], zoom: 5 },
  };

  const handleRegionChange = (regionKey: string) => {
    setSelectedRegion(regionKey);
    const reg = REGIONS[regionKey];
    if (reg && mapRef.current) {
      mapRef.current.flyTo(reg.center, reg.zoom, { duration: 1.5 });
    }
  };

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

    const tiles = getLeafletTileConfig();
    L.tileLayer(tiles.url, tiles.options).addTo(map);

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
        const color = risk > 60 ? TOKENS.critical : risk > 35 ? TOKENS.warning : TOKENS.primary;

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
            <div style="background:${TOKENS.success}; border:2px solid ${TOKENS.white}; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(16,185,129,0.5);">
              <span style="color:${TOKENS.white}; font-size:12px; font-weight:bold;">+</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:160px; color:#11315F;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:#000000;">${h.name}</h4>
            <p style="margin:2px 0; font-size:11px; color:#11315F;">Trauma Level: <b>Level ${h.traumaLevel || 1}</b></p>
            <p style="margin:2px 0; font-size:11px; color:#11315F;">Capacity: <b>${h.capacityStatus || 'Available'}</b></p>
            ${h.contactInfo?.phone ? `<p style="margin:4px 0 0 0; font-size:11px;"><a href="tel:${h.contactInfo.phone}" style="color:${TOKENS.success}; text-decoration:underline;">📞 ${h.contactInfo.phone}</a></p>` : ''}
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
            <div style="background:${TOKENS.warning}; border:2px solid ${TOKENS.white}; border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(249,115,22,0.6);">
              <span style="color:${TOKENS.white}; font-size:13px;">!</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px; color:#11315F;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:${TOKENS.warning};">${d.type?.replace('_', ' ').toUpperCase()}</h4>
            <p style="margin:2px 0; font-size:11px; color:#11315F;">${d.description}</p>
            <p style="margin:4px 0 0 0; font-size:10px; color:#11315F;">Severity: <b>${d.severity}</b></p>
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
              <div style="background:${TOKENS.critical}; border:2px solid ${TOKENS.white}; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px ${TOKENS.critical};">
                <span style="color:${TOKENS.white}; font-size:10px; font-weight:bold;">SOS</span>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px; color:#11315F;">
            <h4 style="font-weight:bold; margin:0 0 4px 0; color:${TOKENS.critical};">${a.type?.toUpperCase() || 'EMERGENCY SOS'}</h4>
            <p style="margin:2px 0; font-size:11px; color:#11315F;">${a.description}</p>
            <p style="margin:2px 0; font-size:10px; color:${TOKENS.critical};">Status: <b>${a.status}</b></p>
            <a href="/emergency/alerts" style="display:inline-block; margin-top:6px; font-size:11px; color:#000000; font-weight:bold; text-decoration:underline;">Open Response Action →</a>
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
            <div style="background:${TOKENS.primary}; border:2px solid ${TOKENS.surface}; border-radius:8px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(17,49,95,0.6);">
              <span style="font-size:12px;">🚚</span>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([d.lat, d.lng], { icon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family:sans-serif; min-width:160px; color:#11315F;">
          <h4 style="font-weight:bold; margin:0 0 4px 0; color:#000000;">${d.reg}</h4>
          <p style="margin:2px 0; font-size:11px; color:#11315F;">Driver: <b>${d.driver}</b></p>
          <p style="margin:2px 0; font-size:11px; color:#11315F;">Speed: <b>${d.speed} km/h</b></p>
          <span style="display:inline-block; margin-top:4px; padding:2px 6px; border-radius:4px; font-size:9px; background:rgba(39,139,86,0.2); color:${TOKENS.success}; font-weight:bold;">LIVE TELEMETRY</span>
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
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3 rounded">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-main" />
            <h1 className="text-base font-bold text-strong font-sans tracking-tight">
              National Control Map
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-card border border-subtle rounded px-2.5 py-1 text-xs">
            <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="bg-transparent text-main font-semibold focus:outline-none cursor-pointer"
            >
              {Object.keys(REGIONS).map((rKey) => (
                <option key={rKey} value={rKey} className="bg-card text-main">
                  {rKey}
                </option>
              ))}
            </select>
          </div>
        </div>


        {/* Multi-Layer Toggle Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <span className="text-muted text-[11px] font-semibold uppercase mr-1 hidden md:inline">Layers:</span>
          <button
            onClick={() => toggleLayer('corridors')}
            className={`px-3 py-1 rounded border transition-all ${
              layers.corridors
                ? 'bg-[#11315F] dark:bg-primary-700 text-[#DEEBEC] dark:text-white border-primary-500 font-semibold shadow-sm'
                : 'bg-card text-muted hover:text-main border-subtle'
            }`}
          >
            🛣️ Corridors
          </button>
          <button
            onClick={() => toggleLayer('drivers')}
            className={`px-3 py-1 rounded border transition-all ${
              layers.drivers
                ? 'bg-emerald-700 dark:bg-emerald-800 text-white border-emerald-500 font-semibold shadow-sm'
                : 'bg-card text-muted hover:text-main border-subtle'
            }`}
          >
            🚚 Live Drivers
          </button>
          <button
            onClick={() => toggleLayer('alerts')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.alerts
                ? 'bg-rose-700 dark:bg-rose-800 text-white border-rose-500 font-semibold shadow-sm'
                : 'bg-card text-muted hover:text-main border-subtle'
            }`}
          >
            🚨 SOS Alerts
          </button>
          <button
            onClick={() => toggleLayer('disruptions')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.disruptions
                ? 'bg-amber-700 dark:bg-amber-800 text-white border-amber-500 font-semibold shadow-sm'
                : 'bg-card text-muted hover:text-main border-subtle'
            }`}
          >
            ⚠️ Disruptions
          </button>
          <button
            onClick={() => toggleLayer('hospitals')}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              layers.hospitals
                ? 'bg-teal-700 dark:bg-teal-800 text-white border-teal-500 font-semibold shadow-sm'
                : 'bg-card text-muted hover:text-main border-subtle'
            }`}
          >
            🏥 Trauma Hubs
          </button>
        </div>

        <button
          onClick={recenter}
          className="p-1.5 rounded-lg bg-card hover:bg-primary-50 border border-subtle text-main transition-all text-xs flex items-center gap-1"
          title="Recenter Map"
        >
          <Navigation className="w-3.5 h-3.5 text-main" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* Main Map View & Inspection Slideover */}
      <div className="relative flex-1 rounded overflow-hidden border border-subtle ">
        <div ref={mapContainer} className="w-full h-full min-h-[480px] z-10" />

        {/* Corridor Telemetry Drawer when clicked */}
        {selectedCorridor && (
          <div className="absolute top-4 left-4 z-20 w-80 bg-card border border-subtle rounded p-4 backdrop-blur-md animate-in slide-in-from-left duration-200 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-subtle">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted font-bold">
                  {selectedCorridor.highwayRef || 'CORRIDOR'}
                </span>
                <h3 className="text-xs font-bold text-strong leading-snug">{selectedCorridor.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCorridor(null)}
                className="text-muted hover:text-strong text-xs px-1.5 py-0.5 rounded bg-primary-100 border border-subtle"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted">Node Endpoints:</span>
                <span className="font-semibold text-strong">
                  {selectedCorridor.nodeStart} → {selectedCorridor.nodeEnd}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted">Current Utilization</span>
                  <span className="font-mono text-strong font-bold">{selectedCorridor.currentUtilization}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-primary-100 overflow-hidden">
                  <div className="h-full bg-primary dark:bg-primary-400" style={{ width: `${selectedCorridor.currentUtilization}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted">Risk Severity Index</span>
                  <span
                    className={`font-mono font-bold ${
                      selectedCorridor.riskScore > 60
                        ? 'text-critical'
                        : selectedCorridor.riskScore > 35
                        ? 'text-warning'
                        : 'text-success'
                    }`}
                  >
                    {selectedCorridor.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-primary-100 overflow-hidden">
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

              <div className="p-2.5 rounded-lg bg-card border border-subtle grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-muted block">Congestion</span>
                  <span className="font-mono font-semibold text-strong">
                    {selectedCorridor.riskComponents?.congestion ?? 12}%
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Weather Risk</span>
                  <span className="font-mono font-semibold text-success">
                    {selectedCorridor.riskComponents?.weather ?? 8}%
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Active Incidents</span>
                  <span className="font-mono font-semibold text-warning">
                    {selectedCorridor.riskComponents?.incidents ?? 8}%
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Accident Density</span>
                  <span className="font-mono font-semibold text-critical">
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
