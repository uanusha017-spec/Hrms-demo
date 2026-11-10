import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck2,
  Briefcase,
  IndianRupee,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const CompanyAdminDashboard: React.FC = () => {
  const { currentTenant, setCurrentView } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpiRes, moduleRes] = await Promise.all([
          apiFetch('/dashboard/kpis'),
          apiFetch('/modules/all')
        ]);
        setKpis(kpiRes);
        setAuditLogs(moduleRes.auditLogs || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentTenant?.id]);

  if (loading && !kpis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading enterprise metrics...</span>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Headcount',
      value: kpis?.totalEmployees || 0,
      sub: `${kpis?.activeEmployees || 0} active in workforce`,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      action: () => setCurrentView('employees')
    },
    {
      label: 'Present Today',
      value: kpis?.presentToday || 0,
      sub: `${kpis?.lateToday || 0} marked late arrival`,
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      action: () => setCurrentView('attendance')
    },
    {
      label: 'On Leave Today',
      value: kpis?.onLeaveToday || 0,
      sub: `${kpis?.pendingLeaveApprovals || 0} pending review`,
      icon: CalendarCheck2,
      color: 'from-amber-600 to-orange-600',
      action: () => setCurrentView('leave')
    },
    {
      label: 'Monthly Payroll',
      value: `₹${(kpis?.latestPayrollCost || 0).toLocaleString('en-IN')}`,
      sub: `Cycle status: ${kpis?.payrollStatus || 'DRAFT'}`,
      icon: IndianRupee,
      color: 'from-purple-600 to-pink-600',
      action: () => setCurrentView('payroll')
    },
    {
      label: 'Open Requisitions',
      value: kpis?.openPositions || 0,
      sub: 'Active talent pipelines',
      icon: Briefcase,
      color: 'from-cyan-600 to-blue-600',
      action: () => setCurrentView('recruitment')
    },
    {
      label: 'Departments',
      value: kpis?.departmentCount || 5,
      sub: 'Across active branches',
      icon: Building2,
      color: 'from-slate-700 to-slate-800',
      action: () => setCurrentView('organization')
    }
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight break-words">
              {currentTenant?.name || 'Natton Technology'}
            </h1>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Executive Overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time workforce attendance, leave balances, automated payroll calculations, and governance logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('employees')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => setCurrentView('payroll')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <span>Process Payroll</span>
          </button>
          <button
            onClick={() => setCurrentView('leave')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <CalendarCheck2 className="w-4 h-4 text-amber-400" />
            <span>Approve Leaves</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.action}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-all hover:border-slate-700 hover:shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white tracking-tight">{c.value}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </div>
              <div className="text-xs text-slate-400 mt-1">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Live Attendance Trend & Recent Platform Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Shift Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Workforce Attendance Health</h2>
              <p className="text-xs text-slate-400">Shift check-in status for today (Nov 10, 2026)</p>
            </div>
            <button
              onClick={() => setCurrentView('attendance')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Full Roster →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400 font-medium">On-Time Presence</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {Math.max(0, (kpis?.presentToday || 0) - (kpis?.lateToday || 0))}
              </div>
              <span className="text-[10px] text-slate-400">Punched before 09:15 AM</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Late Arrivals</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{kpis?.lateToday || 0}</div>
              <span className="text-[10px] text-slate-400">Within grace period</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Authorized Leave</span>
              <div className="text-xl font-bold text-blue-400 mt-1">{kpis?.onLeaveToday || 0}</div>
              <span className="text-[10px] text-slate-400">Approved via workflow</span>
            </div>
          </div>

          {/* Department Headcount Distribution */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">Department Allocations</div>
            <div className="space-y-2">
              {[
                { name: 'Software Engineering', count: 3, percent: 50, color: 'bg-blue-500' },
                { name: 'Product & UX', count: 1, percent: 17, color: 'bg-indigo-500' },
                { name: 'People & Culture (HR)', count: 1, percent: 17, color: 'bg-emerald-500' },
                { name: 'Finance & Compliance', count: 1, percent: 16, color: 'bg-purple-500' },
              ].map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{d.name}</span>
                    <span className="text-slate-400 font-medium">{d.count} staff ({d.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Immutable Audit Log</h2>
            </div>
            <span className="text-[10px] text-slate-400">Tenant-isolated</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No recent actions logged.</div>
            ) : (
              auditLogs.slice(0, 7).map((log, i) => (
                <div key={i} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-400">{log.action.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">{log.details}</div>
                  <div className="text-[10px] text-slate-400 font-mono">By: {log.userName}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
