import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { OnboardingTask } from '../../types/index.ts';
import {
  Compass,
  CheckCircle2,
  Clock,
  Laptop,
  FileCheck2,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/onboarding/tasks');
      setTasks(res);
    } catch (err) {
      console.error('Failed to load onboarding tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiFetch(`/onboarding/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Digital Employee Onboarding</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automate day-one checklists, hardware provisioning requests, policy acknowledgments, and credential generation.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-right">
          <div className="text-xs text-slate-400">Readiness Score</div>
          <div className="text-lg font-bold text-emerald-400">{progressPercent}% Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-white">Workforce Onboarding Progress</span>
          <span className="text-slate-400">{completedCount} of {tasks.length} Checkpoints Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Checkpoint Title</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Assignee Role</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleTask(t.id, t.status)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {t.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <span className={t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-200'}>
                    {t.title}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">{t.employeeName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 text-[10px] font-bold">
                    {t.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{t.assignedToRole}</td>
                <td className="py-3.5 px-4 font-mono text-slate-300">{t.dueDate}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleTask(t.id, t.status)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      t.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {t.status === 'COMPLETED' ? 'Mark Incomplete' : 'Verify & Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
