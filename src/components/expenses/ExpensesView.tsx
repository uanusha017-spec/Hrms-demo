import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { ExpenseClaim } from '../../types/index.ts';
import {
  Receipt,
  Plus,
  IndianRupee,
  FileText,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [form, setForm] = useState({
    category: 'TRAVEL',
    amount: '120.00',
    merchant: 'Delta Airlines',
    expenseDate: '2026-11-09',
    receiptName: 'delta_ticket_nov09.pdf'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/modules/all');
      setExpenses(res.expenses || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/expenses/submit', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setIsSubmitOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Expense Claims & Reimbursements</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automate receipt submission, travel claims, policy limits, and direct payroll reimbursement disbursements.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Claim</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {expenses.map(exp => (
            <div key={exp.id} className="p-4 space-y-3 bg-slate-900/60 hover:bg-slate-800/40 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm">{exp.employeeName}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-0.5">{exp.category}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  exp.status === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : exp.status === 'APPROVED'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {exp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Merchant / Vendor</div>
                  <div className="text-slate-200 font-medium mt-0.5 truncate">{exp.merchant}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {exp.expenseDate}</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Claim Amount</div>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5 text-sm">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">INR Currency</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-mono text-[11px]">{exp.receiptName || 'receipt.pdf'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table with Horizontal Scroll Guard */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Claimant Employee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Merchant / Vendor</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date Incurred</th>
                <th className="py-3 px-4">Receipt Attached</th>
                <th className="py-3 px-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{exp.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">{exp.category}</td>
                  <td className="py-3.5 px-4 text-slate-300">{exp.merchant}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{exp.expenseDate}</td>
                  <td className="py-3.5 px-4 text-blue-400 font-mono text-[11px] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exp.receiptName || 'receipt.pdf'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      exp.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : exp.status === 'APPROVED'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Submit Reimbursement Claim</h2>
              <button onClick={() => setIsSubmitOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Expense Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="TRAVEL">Business Travel</option>
                  <option value="MEALS">Client Meals & Entertainment</option>
                  <option value="INTERNET">Home Broadband / Remote Office</option>
                  <option value="SOFTWARE">Software / Cloud Subscriptions</option>
                  <option value="OFFICE_SUPPLIES">Office Supplies & Stationery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date Incurred</label>
                  <input
                    type="date"
                    required
                    value={form.expenseDate}
                    onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  required
                  value={form.merchant}
                  onChange={e => setForm({ ...form, merchant: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
