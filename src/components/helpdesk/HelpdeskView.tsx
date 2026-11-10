import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { HelpdeskTicket } from '../../types/index.ts';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export const HelpdeskView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    category: 'PAYROLL',
    priority: 'HIGH',
    subject: '',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/modules/all');
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/helpdesk/tickets', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setIsAddOpen(false);
      setForm({ category: 'PAYROLL', priority: 'HIGH', subject: '', description: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">HR Operations Helpdesk</h1>
          <p className="text-xs text-slate-400 mt-1">
            Service level agreement (SLA) response queues for employee benefits, tax queries, payroll concerns, and IT support.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Raise HR Ticket</span>
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map(t => (
          <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{t.ticketNumber}</span>
                <span className="font-bold text-white text-sm">{t.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.priority === 'URGENT' || t.priority === 'HIGH'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {t.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>Raised by {t.employeeName} • Category: {t.category}</span>
              <span>Assigned: {t.assignedTo || 'Unassigned'}</span>
            </div>

            {t.responses.length > 0 && (
              <div className="mt-2 space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Response History</div>
                {t.responses.map(r => (
                  <div key={r.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1">
                      <span className="font-bold text-blue-400">{r.authorName} (Staff)</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Submit Helpdesk Inquiry</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="PAYROLL">Payroll / Salary</option>
                    <option value="BENEFITS">Insurance / 401(k) Benefits</option>
                    <option value="LEAVE">Leave Policy</option>
                    <option value="IT_SUPPORT">IT / Device Credentials</option>
                    <option value="GENERAL">General Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Summary of issue..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Inquiry *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide context and details..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
