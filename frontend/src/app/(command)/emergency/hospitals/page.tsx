'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hospitalsApi } from '@/lib/api';
import {
  Hospital as HospitalIcon,
  Search,
  MapPin,
  PhoneCall,
  Activity,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

export default function HospitalsPage() {
  const [search, setSearch] = useState('');

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['hospitals-list'],
    queryFn: async () => {
      const res = await hospitalsApi.list();
      return res.data.data;
    },
  });

  const defaultHospitals = [
    {
      _id: 'h1',
      name: 'AIIMS Apex Trauma Center',
      traumaLevel: 1,
      capacityStatus: 'available',
      contactInfo: { address: 'Ring Road, Safdarjung Enclave, New Delhi', phone: '+91-11-2659-3677' },
      capabilities: ['Level 1 Trauma', '24/7 ICU', 'Helipad', 'Burns Unit', 'Neurosurgery'],
      location: { coordinates: [77.2088, 28.5672] },
    },
    {
      _id: 'h2',
      name: 'Safdarjung Emergency Medical Center',
      traumaLevel: 1,
      capacityStatus: 'limited',
      contactInfo: { address: 'Ansari Nagar West, New Delhi', phone: '+91-11-2616-5060' },
      capabilities: ['Level 1 Trauma', 'Emergency Surgery', 'Cardiac ICU'],
      location: { coordinates: [77.2075, 28.5685] },
    },
    {
      _id: 'h3',
      name: 'SN Medical College Trauma Hub',
      traumaLevel: 2,
      capacityStatus: 'available',
      contactInfo: { address: 'Hospital Road, Agra, Uttar Pradesh', phone: '+91-562-226-0353' },
      capabilities: ['Level 2 Trauma', 'ICU', 'Highway Ambulance Standby'],
      location: { coordinates: [78.0081, 27.1767] },
    },
  ];

  const displayHospitals = hospitals && hospitals.length > 0 ? hospitals : defaultHospitals;

  const filtered = displayHospitals.filter((h: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.name?.toLowerCase().includes(q) ||
      h.contactInfo?.address?.toLowerCase().includes(q) ||
      h.capabilities?.some((c: string) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HospitalIcon className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              National Trauma Hospital Network
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold uppercase">
              GOLDEN HOUR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Geocoded emergency trauma centers, ICU readiness, and helipad facilities along national freight corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search hospital, city, capability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map((h: any) => {
          const isLevel1 = h.traumaLevel === 1;
          const isAvailable = h.capacityStatus === 'available';

          return (
            <div
              key={h._id}
              className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isLevel1
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    TRAUMA LEVEL {h.traumaLevel || 1}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {h.capacityStatus || 'Available'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{h.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{h.contactInfo?.address || 'NCR / UP Corridor'}</span>
                  </div>
                </div>

                {/* Capabilities tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {h.capabilities?.map((cap: string) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300 capitalize"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                {h.contactInfo?.phone ? (
                  <a
                    href={`tel:${h.contactInfo.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{h.contactInfo.phone}</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500">Contact Dispatch</span>
                )}

                {h.location?.coordinates && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    [{h.location.coordinates[1].toFixed(2)}, {h.location.coordinates[0].toFixed(2)}]
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
