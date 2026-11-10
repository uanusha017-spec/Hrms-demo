import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { Asset } from '../../types/index.ts';
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Search
} from 'lucide-react';

export const AssetsView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await apiFetch('/modules/all');
        setAssets(res.assets || []);
      } catch (err) {
        console.error('Failed to load assets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentTenant?.id]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">IT & Physical Asset Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track hardware serial numbers, warranties, custodian assignment history, and offboarding recovery.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {assets.map(ast => (
            <div key={ast.id} className="p-4 space-y-3 bg-slate-900/60 hover:bg-slate-800/40 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm">{ast.name}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-0.5">{ast.assetCode} • {ast.category}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {ast.condition}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Serial Number</div>
                  <div className="text-slate-300 font-mono mt-0.5 truncate">{ast.serialNumber}</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Purchase Cost</div>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5">₹{ast.cost.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Custodian / Staff</span>
                  <div className="text-slate-200 font-medium">
                    {ast.assignedToEmployeeName ? ast.assignedToEmployeeName : 'In IT Storage'}
                  </div>
                </div>
                {ast.assignedDate && (
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    Assigned: {ast.assignedDate}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table with Minimum Width Guard */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Device Specification</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Purchase Cost</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Custodian / Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map(ast => (
                <tr key={ast.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{ast.assetCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{ast.name}</div>
                    <span className="text-[10px] text-slate-400 font-semibold">{ast.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{ast.serialNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">₹{ast.cost.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ast.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ast.assignedToEmployeeName ? (
                      <div>
                        <div className="font-bold text-white">{ast.assignedToEmployeeName}</div>
                        <div className="text-[10px] text-slate-400">Assigned: {ast.assignedDate}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">In IT Storage</span>
                    )}
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
