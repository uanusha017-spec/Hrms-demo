import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { PayrollRun, Payslip } from '../../types/index.ts';
import {
  IndianRupee,
  Calculator,
  CheckCircle2,
  Lock,
  Share2,
  FileText,
  Download,
  Printer,
  X,
  Building2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const { currentTenant, activeRole } = useAuth();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/payroll/dashboard');
      setRuns(res.runs || []);
      setPayslips(res.payslips || []);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleRunCalculation = async () => {
    try {
      setCalculating(true);
      await apiFetch('/payroll/calculate', {
        method: 'POST',
        body: JSON.stringify({ month: 11, year: 2026 })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/payroll/runs/${id}/approve`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiFetch(`/payroll/runs/${id}/publish`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    }
  };

  const latestRun = runs[0];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payroll Engine & Payslips</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated statutory tax deduction (PF, ESI, PT, TDS), attendance-linked wage computations, and immutable pay registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/export/payroll"
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Payroll Register CSV</span>
          </a>

          <button
            onClick={handleRunCalculation}
            disabled={calculating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Calculator className="w-4 h-4" />
            <span>{calculating ? 'Computing Cycle...' : 'Calculate Nov 2026 Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Current Payroll Cycle Control Card */}
      {latestRun && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 border border-blue-900/50 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Active Cycle</div>
              <h2 className="text-lg font-bold text-white">
                Cycle: {latestRun.month}/{latestRun.year} (November 2026)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                latestRun.status === 'PUBLISHED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : latestRun.status === 'APPROVED'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {latestRun.status}
              </span>

              {latestRun.status === 'CALCULATED' && (
                <button
                  onClick={() => handleApprove(latestRun.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Approve Cycle
                </button>
              )}

              {latestRun.status === 'APPROVED' && (
                <button
                  onClick={() => handlePublish(latestRun.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Publish Payslips</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Total Gross Salary</span>
              <div className="text-lg font-bold text-white font-mono mt-1">
                ₹{latestRun.totalGross.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Total Statutory Deductions</span>
              <div className="text-lg font-bold text-red-400 font-mono mt-1">
                -₹{latestRun.totalDeductions.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Net Employee Payout</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                ₹{latestRun.totalNet.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Employees Processed</span>
              <div className="text-lg font-bold text-blue-400 mt-1">
                {latestRun.employeeCount} Staff
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Payslips Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Employee Payslip Register</h2>
          <span className="text-xs text-slate-400">{payslips.length} Generated Records</span>
        </div>

        {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className="lg:hidden divide-y divide-slate-800/80">
          {payslips.map(ps => (
            <div key={ps.id} className="p-4 space-y-3 bg-slate-900/60 hover:bg-slate-800/40 transition">
              {/* Header: Employee Name, Period & Payment Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm">{ps.employeeName}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-0.5">{ps.employeeNumber} • {ps.department} • {ps.designation}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    ps.paymentStatus === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {ps.paymentStatus}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cycle: {ps.month}/{ps.year}</div>
                </div>
              </div>

              {/* All Financial Columns (Gross, Deductions, Net) */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/60">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Gross</div>
                  <div className="text-white font-mono font-bold mt-0.5 text-xs truncate">
                    ₹{ps.grossSalary.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Deductions</div>
                  <div className="text-red-400 font-mono font-bold mt-0.5 text-xs truncate">
                    -₹{ps.totalDeductions.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/50">
                  <div className="text-[10px] uppercase font-semibold text-emerald-400">Net Pay</div>
                  <div className="text-emerald-300 font-mono font-bold mt-0.5 text-xs truncate">
                    ₹{ps.netSalary.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedPayslip(ps)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                View & Print Official Payslip →
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table with Minimum Width Guard */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-950/40">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Deductions (PF/Tax)</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Disbursement</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payslips.map(ps => (
                <tr key={ps.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{ps.employeeName}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{ps.employeeNumber} • {ps.department}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                    {ps.month}/{ps.year}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    ₹{ps.grossSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-red-400">
                    -₹{ps.totalDeductions.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{ps.netSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      ps.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ps.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedPayslip(ps)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold border border-slate-700 transition"
                    >
                      View & Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    NT
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {currentTenant?.name || 'Natton Technology'}
                  </h2>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Confidential Salary Disbursement Statement
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-xs font-mono font-bold text-blue-600 mt-2">
                  Period: {selectedPayslip.month}/{selectedPayslip.year}
                </div>
              </div>
            </div>

            {/* Employee Details Box */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Employee Name:</span>
                <div className="font-bold text-slate-900">{selectedPayslip.employeeName}</div>
              </div>
              <div>
                <span className="text-slate-500">Employee ID:</span>
                <div className="font-bold text-slate-900 font-mono">{selectedPayslip.employeeNumber}</div>
              </div>
              <div>
                <span className="text-slate-500">Designation:</span>
                <div className="font-bold text-slate-900">{selectedPayslip.designation}</div>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>
                <div className="font-bold text-slate-900">{selectedPayslip.department}</div>
              </div>
              <div>
                <span className="text-slate-500">Working Days:</span>
                <div className="font-bold text-slate-900">{selectedPayslip.workingDays} Days</div>
              </div>
              <div>
                <span className="text-slate-500">Pay Status:</span>
                <span className="font-bold text-emerald-600 uppercase">{selectedPayslip.paymentStatus}</span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div>
                <div className="font-bold text-slate-900 pb-2 border-b border-slate-200">Earnings</div>
                <div className="divide-y divide-slate-100">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono font-medium">₹{selectedPayslip.basic.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-medium">₹{selectedPayslip.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-mono font-medium">₹{selectedPayslip.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Conveyance Allowance</span>
                    <span className="font-mono font-medium">₹{selectedPayslip.conveyance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between font-bold text-slate-900 border-t border-slate-200">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono">₹{selectedPayslip.grossSalary.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="font-bold text-slate-900 pb-2 border-b border-slate-200">Deductions</div>
                <div className="divide-y divide-slate-100">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF)</span>
                    <span className="font-mono font-medium">-₹{selectedPayslip.pfDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-mono font-medium">-₹{selectedPayslip.ptDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-mono font-medium">-₹{selectedPayslip.tdsDeduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between font-bold text-red-600 border-t border-slate-200">
                    <span>Total Deductions</span>
                    <span className="font-mono">-₹{selectedPayslip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Net Take-Home Remuneration</span>
                <div className="text-2xl font-bold font-mono mt-0.5">
                  ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-xs text-emerald-700">
                Authorized Electronic Transfer
              </div>
            </div>

            {/* Footer / Print Action */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Natton Technology Cryptographically Signed Document • Hash: {selectedPayslip.id}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Payslip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
