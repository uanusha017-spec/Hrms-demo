import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  FileSpreadsheet,
  Download,
  Users,
  Clock,
  IndianRupee,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentTenant } = useAuth();

  const reports = [
    {
      title: 'Complete Employee Master Register',
      desc: 'Full workforce census including employee numbers, designations, departments, branches, compensation tiers, and employment statuses.',
      icon: Users,
      color: 'text-blue-400',
      type: 'employees'
    },
    {
      title: 'Workforce Attendance & Late Arrival Register',
      desc: 'Daily punch timestamps, late arrivals, overtime records, work modes, and GPS/IP verified check-in audit records.',
      icon: Clock,
      color: 'text-emerald-400',
      type: 'attendance'
    },
    {
      title: 'Monthly Statutory Payroll Register',
      desc: 'Itemized salary disbursements, basic pay, HRA, allowances, EPF provident fund, ESI health, PT professional tax, and TDS withholdings.',
      icon: IndianRupee,
      color: 'text-purple-400',
      type: 'payroll'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Compliance & Analytics Reports</h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate and export audit-ready CSV registers formatted for enterprise compliance, payroll audits, and tax filings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reports.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Icon className={`w-5 h-5 ${r.color}`} />
                </div>
                <h2 className="text-sm font-bold text-white leading-snug">{r.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <a
                  href={`/api/v1/export/${r.type}`}
                  download
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Live CSV Export</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
