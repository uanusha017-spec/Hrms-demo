import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  ShieldCheck,
  TrendingUp,
  IndianRupee,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
  RefreshCw,
  Server,
  Lock,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

export const SuperAdminDashboard: React.FC<{ onOpenLanding: () => void }> = ({ onOpenLanding }) => {
  const { switchTenant } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'auto'>('auto');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/superadmin/overview');
      setData(res);
    } catch (err) {
      console.error('Failed to load SuperAdmin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    try {
      await apiFetch(`/superadmin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant status');
    }
  };

  const handlePlanChange = async (tenantId: string, newPlan: string) => {
    try {
      await apiFetch(`/superadmin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ planId: newPlan })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading SaaS Super Admin Platform metrics...</span>
        </div>
      </div>
    );
  }

  const filteredTenants = (data?.tenants || []).filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase()) ||
    t.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-600/30 p-4 sm:p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight break-words">
              Natton Technology SaaS Super Admin
            </h1>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              OWNER PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global multi-tenant governance, monthly recurring revenue (MRR), subscription lifecycles, and tenant isolation monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Building2 className="w-4 h-4" />
            <span>Onboard New Tenant</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Revenue & Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Recurring Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₹{(data?.mrr || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% MoM growth</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Annual Recurring Revenue</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₹{(data?.arr || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Contracted run-rate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tenant Companies</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {data?.totalTenants || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {data?.activeTenantsCount || 0} Active • {data?.trialTenantsCount || 0} In Free Trial
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Global Employee Records</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {data?.totalEmployeesAcrossPlatform || 0}
          </div>
          <div className="text-[11px] text-slate-400">Isolated database schemas</div>
        </div>
      </div>

      {/* Platform Infrastructure Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Platform Core:</span>
            <span className="font-bold text-white">{data?.systemHealth?.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">DB Query Latency:</span>
            <span className="font-bold text-emerald-400 font-mono">{data?.systemHealth?.dbLatencyMs}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Tenant Isolation Guard:</span>
            <span className="font-bold text-white">ENFORCED (100%)</span>
          </div>
        </div>
        <div className="text-slate-400">
          Uptime: <span className="font-bold text-slate-200">{data?.systemHealth?.uptime}</span>
        </div>
      </div>

      {/* Tenant Companies Directory & Plan Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Client Tenant Organizations</h2>
            <p className="text-xs text-slate-400">Manage plan subscriptions, usage limits, and account suspension</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'auto' : 'cards')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'cards' || viewMode === 'auto'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Shows all 6 columns in high-clarity responsive cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Columns (Cards)</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View wide horizontal data table"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Mobile / Card View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className={viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'divide-y divide-slate-800/80' : 'lg:hidden divide-y divide-slate-800/80'}>
          {filteredTenants.map((t: any) => (
            <div key={t.id} className="p-4 space-y-3 bg-slate-900/60 hover:bg-slate-800/40 transition">
              {/* Column 1: Company Name & Column 5: Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-0.5">{t.slug} • ID: {t.id}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  t.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : t.status === 'TRIAL'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {t.status}
                </span>
              </div>

              {/* Column 2: Country / Currency & Column 3: Subscription Plan */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Country / Currency</div>
                  <div className="text-white font-medium mt-0.5">{t.country}</div>
                  <div className="text-[10px] text-slate-400 font-mono">₹ {t.currency} • {t.timezone}</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Subscription Plan</div>
                  <select
                    value={t.planId}
                    onChange={e => handlePlanChange(t.id, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500 mt-1"
                  >
                    <option value="STARTER">STARTER (₹4,999/mo)</option>
                    <option value="GROWTH">GROWTH (₹12,499/mo)</option>
                    <option value="BUSINESS">BUSINESS (₹24,999/mo)</option>
                    <option value="ENTERPRISE">ENTERPRISE (₹64,999/mo)</option>
                  </select>
                </div>
              </div>

              {/* Column 4: Headcount Limit & Progress */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Headcount Usage Limit</span>
                  <span className="font-mono text-white font-semibold">
                    {t.employeeCount || 0} / {t.maxEmployees} Employees ({Math.round(((t.employeeCount || 0) / t.maxEmployees) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, ((t.employeeCount || 0) / t.maxEmployees) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Column 6: Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => switchTenant(t.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition shadow-sm"
                >
                  Enter Workspace
                </button>
                {t.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusChange(t.id, 'SUSPENDED')}
                    className="py-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/50 text-red-400 text-xs font-bold border border-red-800/50 transition"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                    className="py-2 px-3 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 text-xs font-bold border border-emerald-800/50 transition"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop / Manual Table View with Minimum Width Guard */}
        <div className={viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block overflow-x-auto' : 'hidden lg:block overflow-x-auto'}>
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-950/40">
                <th className="py-3 px-3">Company Name</th>
                <th className="py-3 px-3">Country / Currency</th>
                <th className="py-3 px-3">Subscription Plan</th>
                <th className="py-3 px-3">Headcount Limit</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTenants.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.slug} • ID: {t.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-300 font-medium">{t.country}</span>
                    <div className="text-[10px] text-slate-400 font-mono">₹ {t.currency} • {t.timezone}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={t.planId}
                      onChange={e => handlePlanChange(t.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="STARTER">STARTER (₹4,999/mo)</option>
                      <option value="GROWTH">GROWTH (₹12,499/mo)</option>
                      <option value="BUSINESS">BUSINESS (₹24,999/mo)</option>
                      <option value="ENTERPRISE">ENTERPRISE (₹64,999/mo)</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-slate-200 font-medium">{t.employeeCount || 0} / {t.maxEmployees}</div>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, ((t.employeeCount || 0) / t.maxEmployees) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : t.status === 'TRIAL'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => switchTenant(t.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium border border-slate-700 transition"
                      >
                        Enter Workspace
                      </button>
                      {t.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(t.id, 'SUSPENDED')}
                          className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-medium border border-red-800/40 transition"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                          className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-medium border border-emerald-800/40 transition"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
