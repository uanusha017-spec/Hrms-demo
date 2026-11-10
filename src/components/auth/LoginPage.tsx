import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Briefcase,
  User,
  ShieldAlert,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const LoginPage: React.FC<{ onOpenRegister: () => void }> = ({ onOpenRegister }) => {
  const { login, accessibleTenants } = useAuth();
  const [email, setEmail] = useState('ceo@nattontech.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedTenantId, setSelectedTenantId] = useState('tenant-apex');
  const [selectedRoleId, setSelectedRoleId] = useState('COMPANY_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleProfiles = [
    {
      id: 'COMPANY_ADMIN',
      email: 'ceo@nattontech.com',
      name: 'Victoria Vance',
      roleTitle: 'Company Admin / CEO',
      desc: 'Complete workforce oversight, payroll sign-off & corporate settings',
      icon: Building2,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      iconColor: 'text-blue-400 bg-blue-950/60'
    },
    {
      id: 'HR_ADMIN',
      email: 'hr@nattontech.com',
      name: 'Elena Rostova',
      roleTitle: 'HR Administrator',
      desc: 'Employee directory, leave approvals, recruitment & digital onboarding',
      icon: Users,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      iconColor: 'text-emerald-400 bg-emerald-950/60'
    },
    {
      id: 'PAYROLL_ADMIN',
      email: 'payroll@nattontech.com',
      name: 'Devin Kothari',
      roleTitle: 'Payroll Administrator',
      desc: 'Salary structures, monthly tax computations (PF/ESI/TDS) & payslips',
      icon: CreditCard,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      iconColor: 'text-indigo-400 bg-indigo-950/60'
    },
    {
      id: 'DEPARTMENT_MANAGER',
      email: 'engineering.head@nattontech.com',
      name: 'David Sterling',
      roleTitle: 'Department Manager',
      desc: 'Team attendance review, leave sign-offs & performance OKRs',
      icon: Briefcase,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      iconColor: 'text-purple-400 bg-purple-950/60'
    },
    {
      id: 'EMPLOYEE',
      email: 'sarah.chen@nattontech.com',
      name: 'Sarah Chen',
      roleTitle: 'Employee Self-Service',
      desc: 'Web punch in/out, view payslips, apply for leaves & helpdesk',
      icon: User,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      iconColor: 'text-teal-400 bg-teal-950/60'
    },
    {
      id: 'SUPER_ADMIN',
      email: 'admin@zenithhrms.io',
      name: 'Alexander Wright',
      roleTitle: 'SaaS Platform Super Admin',
      desc: 'Global multi-tenant management, MRR/ARR metrics & plan provisioning',
      icon: ShieldAlert,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-amber-400 bg-amber-950/60'
    }
  ];

  const handleSelectRoleProfile = (profile: typeof roleProfiles[0]) => {
    setSelectedRoleId(profile.id);
    setEmail(profile.email);
    setPassword('••••••••••••');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide or select an email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password, selectedTenantId);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20 mb-2">
            NT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Natton<span className="text-blue-400"> Technology</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enterprise Multi-Tenant Human Resource Management System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-white">Select Role & Access Platform</h2>
            <p className="text-xs text-slate-400">
              Pick an enterprise role persona below or enter your authorized credentials to enter the live dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Quick Role Selection Grid */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              1. Choose Active Enterprise Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roleProfiles.map(p => {
                const Icon = p.icon;
                const isSelected = selectedRoleId === p.id && email === p.email;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectRoleProfile(p)}
                    className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${p.iconColor} shrink-0 mt-0.5 border border-slate-700/60`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{p.roleTitle}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-blue-300 font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tenant & Sign-In Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tenant Workspace
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="tenant-apex">Natton Technology (HQ)</option>
                    <option value="tenant-nexus">Nexus Retail Ltd</option>
                    <option value="tenant-vertex">Vertex Digital Agency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying & Loading Workspace...' : `Enter Natton Dashboard (${selectedRoleId.replace('_', ' ')})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SaaS Registration & Device Persistence Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-device Persistent Store Active</span>
            </div>
            <button
              type="button"
              onClick={onOpenRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Register New Client Organization</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
