import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { Resignation } from '../../types/index.ts';
import {
  UserMinus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  IndianRupee,
  AlertTriangle
} from 'lucide-react';

export const ExitManagementView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/offboarding/resignations');
      setResignations(res);
    } catch (err) {
      console.error('Failed to load resignations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleToggleClearance = async (id: string, clearanceType: string, currentValue: boolean) => {
    try {
      await apiFetch(`/offboarding/resignations/${id}/clearance`, {
        method: 'PATCH',
        body: JSON.stringify({ clearanceType, value: !currentValue })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Exit & Resignation Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            4-Department clearance protocol (Operations, IT Hardware, Finance, HR), notice period monitoring, and Full & Final (F&F) settlement.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {resignations.map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{r.employeeName}</h2>
                  <span className="text-xs text-blue-400 font-mono">({r.employeeNumber})</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Department: {r.department} • Notice Period End: <span className="text-white font-mono">{r.desiredLastDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  r.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {r.status === 'COMPLETED' ? 'ALL CLEARANCES COMPLETED' : 'CLEARANCE IN PROGRESS'}
                </span>
                {r.settlementAmount && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                    F&F: ₹{r.settlementAmount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-400">Exit Reason: </span>
              <span>{r.reason}</span>
            </div>

            {/* 4 Clearance Checkpoints */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Departmental Clearance Matrix
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'department', label: 'Department Handover', done: r.clearances.department },
                  { id: 'itAssets', label: 'IT Assets Surrendered', done: r.clearances.itAssets },
                  { id: 'finance', label: 'Finance & Loan Dues', done: r.clearances.finance },
                  { id: 'hr', label: 'HR Exit Interview', done: r.clearances.hr },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleToggleClearance(r.id, c.id, c.done)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition ${
                      c.done
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-blue-500'
                    }`}
                  >
                    <span>{c.label}</span>
                    <CheckCircle2 className={`w-4 h-4 ${c.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
