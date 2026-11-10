import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Users,
  Clock,
  IndianRupee,
  Smartphone,
  Globe,
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { switchTenant } = useAuth();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    contactPerson: '',
    phone: '',
    country: 'United States',
    state: 'NY',
    city: 'New York',
    planId: 'BUSINESS',
    currency: 'USD',
    timezone: 'America/New_York'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiFetch('/auth/register-company', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      alert(`Congratulations! ${res.tenant.name} has been provisioned.`);
      setIsRegisterOpen(false);
      await switchTenant(res.tenant.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Company registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-base">
            NT
          </div>
          <div>
            <span className="font-bold text-lg text-white">Natton<span className="text-blue-400"> Technology</span></span>
            <span className="ml-2 text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              Enterprise HRMS Cloud
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            Start 14-Day Free Trial
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Return to App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-xs font-semibold text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Next-Generation Multi-Tenant HRMS & Payroll Cloud</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Enterprise Workforce Operations <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            From Recruitment to Final Settlement
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The all-in-one human resource platform built for fast-moving startups, scale-ups, and global enterprises. Strict multi-tenant data isolation, automated statutory payroll, and geofenced attendance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition"
          >
            <span>Register Your Organization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-sm font-bold transition"
          >
            Explore Live Demo Workspace
          </button>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-12 px-6 max-w-6xl mx-auto border-t border-slate-800">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white">Commercial SaaS Product Pillars</h2>
          <p className="text-xs text-slate-400">Engineered with defensive security, transaction safety, and sub-second speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every database query and API mutation is strictly tenant-scoped. Company A can never read or mutate Company B data.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Compliant Statutory Payroll</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Effective-dated calculation engine handling EPF, ESI, Professional Tax, TDS withholding, LOP days, and instant PDF payslips.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Native Mobile & Web Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Geofenced check-in/out, leave balance tracking, digital onboarding checklists, and 4-department clearance offboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Grid */}
      <section className="py-12 px-6 max-w-6xl mx-auto border-t border-slate-800">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white">Transparent Commercial Pricing</h2>
          <p className="text-xs text-slate-400">All plans include 14-day full-featured free trial. No credit card required upfront.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'STARTER', name: 'Starter', price: '₹4,999', period: '/mo', limits: 'Up to 20 Employees' },
            { id: 'GROWTH', name: 'Growth', price: '₹12,499', period: '/mo', limits: 'Up to 50 Employees' },
            { id: 'BUSINESS', name: 'Business Pro', price: '₹24,999', period: '/mo', popular: true, limits: 'Up to 100 Employees' },
            { id: 'ENTERPRISE', name: 'Enterprise', price: '₹64,999', period: '/mo', limits: 'Unlimited Employees' },
          ].map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-bold text-white text-sm">{p.name}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white font-mono">{p.price}</span>
                  <span className="text-xs text-slate-400">{p.period}</span>
                </div>
                <div className="text-[11px] text-blue-400 font-semibold">{p.limits}</div>
              </div>

              <button
                onClick={() => {
                  setForm(prev => ({ ...prev, planId: p.id }));
                  setIsRegisterOpen(true);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
              >
                Start Trial with {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Real Company Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Register New Organization</h2>
                <div className="text-xs text-slate-400">Instant tenant database provisioning & admin setup</div>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company Legal Name *</label>
                  <input
                    required
                    type="text"
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. Horizon Labs Inc"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Corporate Email *</label>
                  <input
                    required
                    type="email"
                    value={form.companyEmail}
                    onChange={e => setForm({ ...form, companyEmail: e.target.value })}
                    placeholder="admin@horizonlabs.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Authorized Contact Person *</label>
                  <input
                    required
                    type="text"
                    value={form.contactPerson}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 987-6543"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">State / Province</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preferred Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Selected Plan</label>
                  <select
                    value={form.planId}
                    onChange={e => setForm({ ...form, planId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-blue-400"
                  >
                    <option value="STARTER">Starter (₹4,999/mo)</option>
                    <option value="GROWTH">Growth (₹12,499/mo)</option>
                    <option value="BUSINESS">Business Pro (₹24,999/mo)</option>
                    <option value="ENTERPRISE">Enterprise (₹64,999/mo)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? 'Provisioning Tenant...' : 'Provision Enterprise Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
