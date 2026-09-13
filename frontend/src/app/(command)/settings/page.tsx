'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, highwaysApi, usersApi, auditLogApi } from '@/lib/api';
import {
  Settings,
  Database,
  Users,
  Shield,
  Activity,
  Plus,
  RefreshCw,
  CheckCircle2,
  Trash2,
  X,
  Lock,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'sources' | 'users' | 'audit'>('sources');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: 'NetraDemo123!',
    role: 'dispatcher',
  });

  const [newSource, setNewSource] = useState({
    name: 'Weather Sensors IoT Feed',
    kind: 'webhook',
  });

  const { data: sources } = useQuery({
    queryKey: ['settings-sources'],
    queryFn: async () => {
      const res = await settingsApi.getDataSources();
      return res.data.data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['settings-users'],
    queryFn: async () => {
      const res = await usersApi.list();
      return res.data.data;
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['settings-audit'],
    queryFn: async () => {
      const res = await auditLogApi.list();
      return res.data.data;
    },
  });

  const syncHighwaysMutation = useMutation({
    mutationFn: async () => {
      await highwaysApi.sync();
    },
    onSuccess: () => {
      toast.success('Highways synchronized from OSM Overpass vector servers!');
    },
    onError: () => {
      toast.error('OSM Overpass sync failed');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      await usersApi.create(data);
    },
    onSuccess: () => {
      toast.success('User provisioned with role permissions');
      setShowAddUserModal(false);
      setNewUser({ email: '', name: '', password: 'NetraDemo123!', role: 'dispatcher' });
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await usersApi.delete(id);
    },
    onSuccess: () => {
      toast.success('User account de-provisioned');
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-main font-sans">
              System Settings & Gateways
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-subtle text-primary font-mono text-[10px] font-semibold uppercase">
              ENTERPRISE CORE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            OSM Overpass synchronization, user role scopes, telemetry data sources, and immutable audit trails.
          </p>
        </div>

        <button
          onClick={() => syncHighwaysMutation.mutate()}
          disabled={syncHighwaysMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded btn-primary text-xs font-semibold text-on-primary transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncHighwaysMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{syncHighwaysMutation.isPending ? 'Syncing OSM...' : 'Sync OSM Highways'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-subtle pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === 'sources'
              ? 'bg-cyan-500/20 text-primary border border-subtle shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          Data Sources & Adapters
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === 'users'
              ? 'bg-cyan-500/20 text-primary border border-subtle shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          User & Role Management
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === 'audit'
              ? 'bg-cyan-500/20 text-primary border border-subtle shadow-sm'
              : 'text-muted hover:text-main'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {/* Tab 1: Data Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded flex items-center justify-between border-emerald-500/30">
              <div>
                <div className="font-bold text-sm text-main">NHAI FASTag Gantry API</div>
                <div className="text-xs text-muted mt-0.5">Adapter: <b className="text-primary font-mono">REST/SSE</b></div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-safe-bg text-success border border-emerald-500/40">
                CONNECTED
              </span>
            </div>

            <div className="glass-card p-5 rounded flex items-center justify-between border-emerald-500/30">
              <div>
                <div className="font-bold text-sm text-main">IMD Doppler Weather Radar</div>
                <div className="text-xs text-muted mt-0.5">Adapter: <b className="text-primary font-mono">POLAR-GEOJSON</b></div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-safe-bg text-success border border-emerald-500/40">
                CONNECTED
              </span>
            </div>

            <div className="glass-card p-5 rounded flex items-center justify-between border-emerald-500/30">
              <div>
                <div className="font-bold text-sm text-main">In-Cab OBD-II Telematics Ping</div>
                <div className="text-xs text-muted mt-0.5">Adapter: <b className="text-primary font-mono">SOCKET.IO</b></div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-safe-bg text-success border border-emerald-500/40">
                STREAMING
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Manage operators and security permissions</span>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded btn-primary text-on-primary text-xs font-semibold text-main shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Provision Operator
            </button>
          </div>

          <div className="glass-card rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-subtle text-muted bg-white/[0.02]">
                  <th className="py-3 px-4 font-semibold">User Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Assigned Role</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {users?.map((u: any) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-main font-sans">{u.name}</td>
                    <td className="py-3 px-4 text-primary">{u.email}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-main uppercase">
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.email !== 'admin@netra.local' && (
                        <button
                          onClick={() => deleteUserMutation.mutate(u._id)}
                          className="p-1.5 rounded-lg bg-critical-50 hover:bg-rose-500/30 border border-rose-500/30 text-critical transition-all"
                          title="De-provision user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="glass-card rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-subtle text-muted bg-white/[0.02]">
                  <th className="py-3 px-4 font-semibold">Action Event</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Resource</th>
                  <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {auditLogs?.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-primary font-semibold">{log.action || 'AUTH_LOGIN'}</td>
                    <td className="py-3 px-4 text-main font-sans">{log.userEmail || 'admin@netra.local'}</td>
                    <td className="py-3 px-4 text-muted font-sans">{log.resource || 'Session'}</td>
                    <td className="py-3 px-4 text-right text-muted font-sans">
                      {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-muted font-sans">
                      No security audit log entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <h3 className="text-base font-bold text-main">Provision New Operator</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-main font-medium block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@netra.local"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-main font-medium block mb-1">Security Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="glass-input w-full p-2.5 rounded text-main text-xs focus:outline-none bg-card"
                >
                  <option value="admin">System Admin</option>
                  <option value="ops_manager">Operations Manager</option>
                  <option value="controller">Shipment Controller</option>
                  <option value="analyst">Risk Analyst</option>
                  <option value="dispatcher">Emergency Dispatcher</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="driver">Driver</option>
                  <option value="viewer">Executive Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded bg-white/[0.05] hover:bg-white/[0.08] text-main text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => createUserMutation.mutate(newUser)}
                disabled={createUserMutation.isPending}
                className="px-4 py-2 rounded btn-primary text-on-primary text-main text-xs font-semibold "
              >
                {createUserMutation.isPending ? 'Provisioning...' : 'Provision User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
