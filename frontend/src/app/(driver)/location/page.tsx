'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { trackingApi } from '@/lib/api';
import {
  Radio,
  Play,
  Square,
  Navigation,
  MapPin,
  Activity,
  CheckCircle2,
  Gauge,
  Send,
  Zap,
  Clock,
  Compass,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NH44_WAYPOINTS = [
  { lat: 28.6139, lng: 77.209, name: 'Delhi Gate ICD Terminal', km: '0 km' },
  { lat: 28.4089, lng: 77.3178, name: 'Faridabad Bypass Checkpoint', km: '28 km' },
  { lat: 28.1487, lng: 77.332, name: 'Palwal FASTag Toll Plaza', km: '62 km' },
  { lat: 27.4924, lng: 77.6737, name: 'Mathura Refinery Junction', km: '124 km' },
  { lat: 27.1767, lng: 77.973, name: 'Agra Dry Port Freight Gate', km: '198 km' },
];

export default function DriverLocationPage() {
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(1);
  const [speed, setSpeed] = useState(64);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string>('Just now');
  const [pingCount, setPingCount] = useState(14);
  const simTimerRef = useRef<any>(null);

  const pingMutation = useMutation({
    mutationFn: async (coords: { lat: number; lng: number; speed: number }) => {
      await trackingApi.ping({
        lat: coords.lat,
        lng: coords.lng,
        speed: coords.speed,
        heading: 145,
        recordedAt: new Date().toISOString(),
        tripId: 'SHP-DEL-AGR-0941',
      });
    },
    onSuccess: () => {
      setLastPingTime(new Date().toLocaleTimeString());
      setPingCount((c) => c + 1);
    },
    onError: () => {
      // Fallback demo simulation
      setLastPingTime(new Date().toLocaleTimeString());
      setPingCount((c) => c + 1);
    },
  });

  const sendSinglePing = () => {
    const pt = NH44_WAYPOINTS[currentWaypointIdx];
    pingMutation.mutate({ lat: pt.lat, lng: pt.lng, speed });
    toast.success(`GPS telemetry beacon transmitted: ${pt.name}`);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simTimerRef.current);
      setIsSimulating(false);
      toast('Corridor drive simulation stopped');
    } else {
      setIsSimulating(true);
      toast.success('Corridor drive simulation active! Broadcasting every 3s');
    }
  };

  useEffect(() => {
    if (isSimulating) {
      simTimerRef.current = setInterval(() => {
        setCurrentWaypointIdx((prev) => {
          const next = (prev + 1) % NH44_WAYPOINTS.length;
          const pt = NH44_WAYPOINTS[next];
          const newSpeed = 58 + Math.floor(Math.random() * 18);
          setSpeed(newSpeed);
          pingMutation.mutate({ lat: pt.lat, lng: pt.lng, speed: newSpeed });
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(simTimerRef.current);
  }, [isSimulating]);

  const currentPt = NH44_WAYPOINTS[currentWaypointIdx];

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-24">
      {/* Header */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h1 className="text-xl font-bold text-white font-mono tracking-tight">
            LIVE GPS TELEMATICS BEACON
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Simulate or broadcast real-time vehicle GPS coordinates to the FreightIntel Control Tower along the NH-44 corridor.
        </p>
      </div>

      {/* Main Beacon Transmitter Card */}
      <div className="glass-panel p-6 space-y-5 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Pulse Visualizer */}
        <div className="relative inline-flex items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all ${
              isSimulating
                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-400 shadow-xl shadow-emerald-500/20'
                : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10'
            }`}
          >
            <Radio className={`w-12 h-12 ${isSimulating ? 'animate-bounce' : ''}`} />
          </div>
          {isSimulating && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
          )}
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            ACTIVE WAYPOINT FIX
          </div>
          <h2 className="text-lg font-bold text-white font-mono mt-1">{currentPt.name}</h2>
          <div className="text-xs font-mono text-cyan-400 mt-1 flex items-center justify-center gap-3">
            <span>Lat: {currentPt.lat.toFixed(4)}° N</span>
            <span>•</span>
            <span>Lng: {currentPt.lng.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Speedometer & Transmission Stats */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">SPEED</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">{speed} km/h</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">BEACONS</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-0.5 block">{pingCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06]">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">LAST BROADCAST</span>
            <span className="text-xs font-bold font-mono text-white mt-1.5 block truncate">
              {lastPingTime}
            </span>
          </div>
        </div>

        {/* Speed Adjustment Slider */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.06] text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Simulate Cruising Speed:</span>
            <span className="text-cyan-400 font-mono font-bold">{speed} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={toggleSimulation}
            className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isSimulating ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isSimulating ? 'PAUSE CORRIDOR DRIVE SIMULATION' : 'START HIGHWAY DRIVE SIMULATOR'}</span>
          </button>

          <button
            onClick={sendSinglePing}
            disabled={isSimulating || pingMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-mono font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRANSMIT SINGLE TELEMATICS PACKET</span>
          </button>
        </div>
      </div>

      {/* Corridor Waypoints Progression */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            CORRIDOR WAYPOINTS CHECKLIST
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">NH-44 SECTION</span>
        </div>

        <div className="space-y-2">
          {NH44_WAYPOINTS.map((wp, idx) => {
            const isCurrent = idx === currentWaypointIdx;
            const isPassed = idx < currentWaypointIdx;
            return (
              <button
                key={wp.name}
                onClick={() => {
                  setCurrentWaypointIdx(idx);
                  pingMutation.mutate({ lat: wp.lat, lng: wp.lng, speed });
                  toast.success(`Jumped to checkpoint: ${wp.name}`);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-500/40 shadow-md shadow-cyan-500/10'
                    : isPassed
                    ? 'bg-slate-900/40 border-white/[0.04] opacity-75'
                    : 'bg-slate-900/60 border-white/[0.06] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      isCurrent
                        ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/20'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{wp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {wp.lat.toFixed(3)}°N, {wp.lng.toFixed(3)}°E
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-300 font-semibold">{wp.km}</span>
                  {isCurrent && (
                    <span className="block text-[9px] font-mono text-cyan-400 uppercase font-bold">
                      CURRENT FIX
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
