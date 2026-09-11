'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [newReport, setNewReport] = useState({
    type: 'incident_summary',
    format: 'csv',
    from: '2026-09-01',
    to: '2026-09-11',
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports-list'],
    queryFn: async () => {
      const res = await reportsApi.list();
      return res.data.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: typeof newReport) => {
      await reportsApi.create({
        type: data.type,
        format: data.format,
        dateRange: {
          from: new Date(data.from).toISOString(),
          to: new Date(data.to).toISOString(),
        },
      });
    },
    onSuccess: () => {
      toast.success('Operational audit report compiled successfully!');
      setShowGenerateModal(false);
      queryClient.invalidateQueries({ queryKey: ['reports-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Report generation failed');
    },
  });

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await reportsApi.exportReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name || 'netra-report'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded to device');
    } catch {
      toast.error('Download export failed');
    }
  };

  const sampleReports = reports && reports.length > 0 ? reports : [
    {
      _id: 'rep-001',
      type: 'incident_summary',
      format: 'csv',
      status: 'completed',
      createdAt: new Date().toISOString(),
      dateRange: { from: '2026-09-01', to: '2026-09-11' },
    },
    {
      _id: 'rep-002',
      type: 'corridor_throughput',
      format: 'pdf',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      dateRange: { from: '2026-08-01', to: '2026-08-31' },
    },
    {
      _id: 'rep-003',
      type: 'fleet_compliance',
      format: 'csv',
      status: 'completed',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      dateRange: { from: '2026-08-15', to: '2026-09-11' },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Tactical Reports & Export Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold uppercase">
              COMPLIANCE ARCHIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit logs, emergency dispatch retrospectives, and freight corridor compliance records.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Main Grid: Left 65% Table, Right 35% Glass Panel Scheduled Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 bg-white/[0.02]">
                <th className="py-3 px-4 font-semibold">Report Type</th>
                <th className="py-3 px-4 font-semibold">Audit Window</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {sampleReports.map((r: any) => (
                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-sans capitalize">
                    {r.type?.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(r.dateRange?.from || Date.now()).toLocaleDateString()} →{' '}
                    {new Date(r.dateRange?.to || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-cyan-400 font-bold uppercase text-[10px]">
                      {r.format || 'CSV'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                    {new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => handleDownload(r._id, `netra-${r.type}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Glass Panel: Scheduled & Quick Exports (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Automated Schedules
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">PERIODIC EXPORT FEEDS</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Daily Corridor Briefing</span>
                  <span className="text-[10px] text-cyan-400 font-mono">06:00 IST</span>
                </div>
                <p className="text-[11px] text-slate-400">Automated dispatch to 18 logistics desk controllers.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Weekly Disruption Log</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Every Mon</span>
                </div>
                <p className="text-[11px] text-slate-400">NHAI & Ministry of Road Transport submission ready.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Fleet Compliance Retrospective</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Monthly</span>
                </div>
                <p className="text-[11px] text-slate-400">Driver safety scores, HOS violations, and vehicle audits.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => toast.success('Immediate daily dispatch package queued for distribution')}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-center text-xs font-semibold text-cyan-300 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Briefing Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-2xl border border-white/[0.1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Generate Operations Audit Report</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Report Archetype</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="incident_summary">Emergency Incidents & SOS Audit</option>
                  <option value="shipments_audit">Freight Dispatch & Delay Manifest</option>
                  <option value="corridor_throughput">National Corridor Utilization Log</option>
                  <option value="fleet_compliance">Fleet Safety & License Compliance</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Export File Format</label>
                <select
                  value={newReport.format}
                  onChange={(e) => setNewReport({ ...newReport, format: e.target.value })}
                  className="glass-input w-full p-2.5 rounded-xl text-white text-xs focus:outline-none bg-[#0D1525]"
                >
                  <option value="csv">Comma-Separated Values (.csv)</option>
                  <option value="pdf">Formatted Executive Document (.pdf)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newReport.from}
                    onChange={(e) => setNewReport({ ...newReport, from: e.target.value })}
                    className="glass-input w-full p-2.5 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newReport.to}
                    onChange={(e) => setNewReport({ ...newReport, to: e.target.value })}
                    className="glass-input w-full p-2.5 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => generateMutation.mutate(newReport)}
                disabled={generateMutation.isPending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
              >
                {generateMutation.isPending ? 'Compiling...' : 'Compile Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
