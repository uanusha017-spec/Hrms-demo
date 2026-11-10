import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { PerformanceGoal } from '../../types/index.ts';
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  Sliders,
  AlertCircle
} from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/modules/all');
      setGoals(res.performanceGoals || []);
    } catch (err) {
      console.error('Failed to load performance goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Performance Management & OKRs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track strategic objectives, key results, 360-degree feedback reviews, and competency evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-700/50 text-xs font-bold">
            Q4 2026 Appraisal Cycle Active
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(g => (
          <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white text-sm">{g.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  {g.category}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium">Owner: {g.employeeName}</div>
              <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Target Metric: </span>
                <span className="text-emerald-400 font-medium">{g.targetMetric}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Progress</span>
                <span className="font-bold text-blue-400">{g.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${g.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Weightage: {g.weightage}%</span>
                <span className="text-emerald-400 font-semibold">{g.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
