import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { Branch, Department, Designation } from '../../types/index.ts';
import {
  Building2,
  MapPin,
  Users,
  Plus,
  Compass,
  IndianRupee,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';

export const OrganizationView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DEPTS' | 'BRANCHES' | 'DESIGNATIONS'>('DEPTS');

  // Modals
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', budget: '500000' });
  const [branchForm, setBranchForm] = useState({ name: '', code: '', city: '', state: '', country: 'United States' });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/organization/all');
      setBranches(res.branches || []);
      setDepartments(res.departments || []);
      setDesignations(res.designations || []);
    } catch (err) {
      console.error('Failed to load org data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/organization/departments', {
        method: 'POST',
        body: JSON.stringify(deptForm)
      });
      setIsAddDeptOpen(false);
      setDeptForm({ name: '', code: '', budget: '500000' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/organization/branches', {
        method: 'POST',
        body: JSON.stringify(branchForm)
      });
      setIsAddBranchOpen(false);
      setBranchForm({ name: '', code: '', city: '', state: '', country: 'United States' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create branch');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Organization Structure & Hierarchy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-branch locations, departmental cost centers, and designation career ladders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('DEPTS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'DEPTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Departments ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab('BRANCHES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'BRANCHES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Branches ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab('DESIGNATIONS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'DESIGNATIONS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Designations ({designations.length})
            </button>
          </div>

          {activeTab === 'DEPTS' ? (
            <button
              onClick={() => setIsAddDeptOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          ) : activeTab === 'BRANCHES' ? (
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Branch</span>
            </button>
          ) : null}
        </div>
      </div>

      {activeTab === 'DEPTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(d => (
            <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{d.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  {d.code}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Budget:</span>
                  <span className="font-bold font-mono text-emerald-400">
                    ₹{(d.budget || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Designations Mapped:</span>
                  <span>{designations.filter(des => des.departmentId === d.id).length} Titles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'BRANCHES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(b => (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">{b.name}</span>
                  <div className="text-xs text-slate-400">{b.city}, {b.state || b.country}</div>
                </div>
                {b.isHeadquarters && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    GLOBAL HQ
                  </span>
                )}
              </div>
              {b.geofence && (
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Geofence Enabled: {b.geofence.radiusMeters}m verification zone</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'DESIGNATIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Designation Title</th>
                <th className="py-3 px-4">Level Band</th>
                <th className="py-3 px-4">Compensation Band (Annual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {designations.map(des => (
                <tr key={des.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{des.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 font-bold">
                      {des.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    ₹{des.minSalary.toLocaleString('en-IN')} - ₹{des.maxSalary.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Dept Modal */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create Department</h2>
              <button onClick={() => setIsAddDeptOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Name *</label>
                <input
                  required
                  type="text"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Research"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Code *</label>
                <input
                  required
                  type="text"
                  value={deptForm.code}
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. AIR"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Annual Budget (USD)</label>
                <input
                  type="number"
                  value={deptForm.budget}
                  onChange={e => setDeptForm({ ...deptForm, budget: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
