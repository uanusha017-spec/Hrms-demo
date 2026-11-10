import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  TrendingUp,
  Download,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const BillingSubscriptionView: React.FC = () => {
  const { currentTenant, refreshAuth } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  const plans = [
    {
      id: 'STARTER',
      name: 'Starter Plan',
      price: '₹4,999',
      period: '/month',
      limits: 'Up to 20 Employees • 1 Branch',
      features: ['Core HR & Directory', 'Web Attendance Check-in', 'Leave Management', 'Standard Payslips']
    },
    {
      id: 'GROWTH',
      name: 'Growth Plan',
      price: '₹12,499',
      period: '/month',
      limits: 'Up to 50 Employees • 3 Branches',
      features: ['All Starter Features', 'Recruitment ATS', 'Overtime & Night Shifts', 'Expense Claims Management', 'Custom Reports Export']
    },
    {
      id: 'BUSINESS',
      name: 'Business Pro',
      price: '₹24,999',
      period: '/month',
      popular: true,
      limits: 'Up to 100 Employees • Unlimited Branches',
      features: ['All Growth Features', 'Automated Statutory Tax Engine', 'White-Label Portal Branding', '360 Performance OKRs', 'Asset Custody Tracking']
    },
    {
      id: 'ENTERPRISE',
      name: 'Global Enterprise',
      price: '₹64,999',
      period: '/month',
      limits: 'Unlimited Employees • Multi-Region',
      features: ['Dedicated Account Architect', 'Custom Single Sign-On (SSO)', 'Custom Domain & Subdomains', 'Enterprise SLA & 24/7 Hotline', 'Custom Payroll Integrations']
    }
  ];

  const handleUpgradePlan = async (planId: string) => {
    try {
      setUpgrading(true);
      await apiFetch(`/superadmin/tenants/${currentTenant?.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ planId })
      });
      await refreshAuth();
      alert(`Tenant subscription upgraded to ${planId} plan successfully!`);
    } catch (err: any) {
      alert(err.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">SaaS Subscription & Billing</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your organization's subscription tier, usage quota entitlements, and payment invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-900/40 text-blue-300 border border-blue-700/50 text-xs font-bold">
            Current Tier: {currentTenant?.planId}
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(p => {
          const isCurrent = currentTenant?.planId === p.id;
          return (
            <div
              key={p.id}
              className={`bg-slate-900 rounded-2xl p-6 flex flex-col justify-between border transition ${
                isCurrent
                  ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                  : p.popular
                  ? 'border-indigo-600/60'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  {p.popular && (
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white font-mono">{p.price}</span>
                  <span className="text-xs text-slate-400">{p.period}</span>
                </div>

                <div className="text-[11px] font-semibold text-blue-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {p.limits}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={isCurrent || upgrading}
                  onClick={() => handleUpgradePlan(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Upgrade to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <h2 className="text-sm font-bold text-white">Billing & Payment Invoices</h2>
        </div>

        {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className="md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
          <div className="p-4 space-y-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono font-bold text-blue-400 text-sm">INV-2026-0091</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Business Pro (Monthly)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                PAID (STRIPE)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Billing Date</span>
                <span className="font-mono text-slate-300 mt-0.5 block">November 1, 2026</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Amount</span>
                <span className="font-mono font-bold text-emerald-400 mt-0.5 block">₹24,999.00 INR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View: Full Data Table with Minimum Width Guard */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-400">INV-2026-0091</td>
                <td className="py-3.5 px-4 font-mono text-slate-300">November 1, 2026</td>
                <td className="py-3.5 px-4 text-slate-200">Business Pro (Monthly)</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹24,999.00 INR</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    PAID (STRIPE)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
