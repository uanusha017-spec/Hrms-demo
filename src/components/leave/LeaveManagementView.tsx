import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { LeaveRequest, LeaveBalance, Holiday, LeaveType } from '../../types/index.ts';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

export const LeaveManagementView: React.FC = () => {
  const { currentTenant, activeRole } = useAuth();
  const [data, setData] = useState<{
    types: LeaveType[];
    balances: LeaveBalance[];
    requests: LeaveRequest[];
    holidays: Holiday[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'BALANCES' | 'HOLIDAYS'>('REQUESTS');

  // Apply form state
  const [form, setForm] = useState({
    employeeId: 'emp-apex-01',
    leaveTypeId: '',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    isHalfDay: false,
    halfDayType: 'FIRST_HALF',
    reason: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/leaves/overview');
      setData(res);
      if (res.types?.length > 0 && !form.leaveTypeId) {
        setForm(prev => ({ ...prev, leaveTypeId: res.types[0].id }));
      }
    } catch (err) {
      console.error('Failed to load leave overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/leaves/apply', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setIsApplyModalOpen(false);
      setForm({ ...form, reason: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to apply for leave');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/leaves/${id}/approve`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      await apiFetch(`/leaves/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Leave Management & Holidays</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure leave entitlements, multi-level approvals, carry-forward rules, and statutory holidays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'REQUESTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Approval Requests
            </button>
            <button
              onClick={() => setActiveTab('BALANCES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'BALANCES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entitlements & Balances
            </button>
            <button
              onClick={() => setActiveTab('HOLIDAYS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'HOLIDAYS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Holiday Calendar
            </button>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {activeTab === 'REQUESTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
          <div className="lg:hidden divide-y divide-slate-800/80">
            {(data?.requests || []).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No leave requests found.
              </div>
            ) : (
              (data?.requests || []).map(r => (
                <div key={r.id} className="p-4 space-y-2.5 bg-slate-900/60 hover:bg-slate-800/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{r.employeeName}</div>
                      <div className="text-[10px] text-blue-400 font-medium">{r.leaveTypeName}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : r.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  {/* Duration & Total Days */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Duration Range</div>
                      <div className="text-white font-mono font-medium mt-0.5">
                        {r.startDate} to {r.endDate}
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Total Days</div>
                      <div className="text-white font-bold mt-0.5">{r.totalDays} Days</div>
                    </div>
                  </div>

                  {/* Reason Column */}
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Reason</span>
                    <p className="leading-relaxed">{r.reason}</p>
                  </div>

                  {/* Workflow Actions */}
                  {r.status === 'PENDING' ? (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                      >
                        Approve Leave
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="flex-1 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-bold border border-red-800/40 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 pt-1 text-right">
                      {r.status === 'APPROVED' ? `✓ Approved by ${r.approverName || 'Manager'}` : '✗ Request Rejected'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Full Data Table with Minimum Width Guard */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.requests || []).map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{r.employeeName}</div>
                      <div className="text-[10px] text-slate-400">Applied {new Date(r.appliedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-blue-400">{r.leaveTypeName}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-mono">
                      {r.startDate} to {r.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{r.totalDays} Days</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{r.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-semibold border border-red-800/40 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {r.status === 'APPROVED' ? `Approved by ${r.approverName || 'Manager'}` : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BALANCES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.types || []).map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{t.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  {t.code}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Allowance:</span>
                  <span className="font-bold text-white">{t.daysPerYear} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Carry Forward:</span>
                  <span>{t.carryForwardMax} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span>{t.isUnpaid ? 'Unpaid / LOP' : 'Fully Paid'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'HOLIDAYS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="text-sm font-bold text-white">Official Holiday Calendar (2026-2027)</div>
          <div className="divide-y divide-slate-800">
            {(data?.holidays || []).map(h => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{h.name}</div>
                  <div className="text-slate-400">{h.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-400">{h.date}</div>
                  <span className="text-[10px] text-slate-400 uppercase">{h.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Submit Leave Request</h2>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Leave Category</label>
                <select
                  value={form.leaveTypeId}
                  onChange={e => setForm({ ...form, leaveTypeId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {(data?.types || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.daysPerYear} days/yr)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Detail the reason for leave..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
