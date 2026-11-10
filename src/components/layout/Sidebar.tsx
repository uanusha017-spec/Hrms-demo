import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Building,
  Clock,
  CalendarDays,
  IndianRupee,
  UserPlus,
  Compass,
  Target,
  FileCheck2,
  Receipt,
  Laptop,
  LifeBuoy,
  Megaphone,
  UserMinus,
  FileSpreadsheet,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeRole,
    currentTenant,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    accessibleTenants,
    switchTenant
  } = useAuth();

  const [isTenantSelectorOpen, setIsTenantSelectorOpen] = React.useState(false);

  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isEmployeeOnly = activeRole === 'EMPLOYEE';

  const menuSections = [
    {
      title: 'Core HR',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'employees', label: 'Employee Directory', icon: Users, hideForEmp: false },
        { id: 'organization', label: 'Organization Structure', icon: Building, hideForEmp: true },
      ]
    },
    {
      title: 'Time & Compensation',
      items: [
        { id: 'attendance', label: 'Attendance & Shifts', icon: Clock },
        { id: 'leave', label: 'Leave & Holidays', icon: CalendarDays },
        { id: 'payroll', label: 'Payroll & Payslips', icon: IndianRupee },
      ]
    },
    {
      title: 'Talent Lifecycle',
      items: [
        { id: 'recruitment', label: 'Recruitment & ATS', icon: UserPlus, hideForEmp: true },
        { id: 'onboarding', label: 'Digital Onboarding', icon: Compass, hideForEmp: true },
        { id: 'performance', label: 'Performance & OKRs', icon: Target },
        { id: 'offboarding', label: 'Exit Management', icon: UserMinus },
      ]
    },
    {
      title: 'Operations & Engagement',
      items: [
        { id: 'timesheets', label: 'Projects & Timesheets', icon: FileCheck2 },
        { id: 'expenses', label: 'Expense Claims', icon: Receipt },
        { id: 'assets', label: 'Asset Management', icon: Laptop, hideForEmp: true },
        { id: 'helpdesk', label: 'HR Helpdesk', icon: LifeBuoy },
        { id: 'engagement', label: 'Company Feed', icon: Megaphone },
      ]
    },
    {
      title: 'Governance & SaaS',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet, hideForEmp: true },
        { id: 'billing', label: 'Subscription & Billing', icon: CreditCard, hideForEmp: true },
      ]
    }
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Current Tenant Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setIsTenantSelectorOpen(!isTenantSelectorOpen)}
          className="w-full flex items-center justify-between mt-1 text-left p-1.5 -mx-1.5 rounded-lg hover:bg-slate-800/60 transition group"
        >
          <div className="font-bold text-white text-sm truncate group-hover:text-blue-300">
            {currentTenant?.name || 'Natton Technology'}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 shrink-0 ml-1" />
        </button>

        {isTenantSelectorOpen && (
          <div className="mt-2 p-2 bg-slate-900 border border-slate-700/80 rounded-xl space-y-1 shadow-lg">
            <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">Switch Organization</div>
            {accessibleTenants.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  switchTenant(t.id);
                  setIsTenantSelectorOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                  t.id === currentTenant?.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="truncate">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.country} • {t.currency}</div>
                </div>
                {t.id === currentTenant?.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1.5" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            {currentTenant?.status || 'ACTIVE'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Plan: <span className="text-slate-200">{currentTenant?.planId}</span>
          </span>
        </div>
      </div>

      {/* Super Admin Special Link */}
      {(isSuperAdmin || activeRole === 'COMPANY_ADMIN') && (
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => handleNavClick('superadmin')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              currentView === 'superadmin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-300 border border-amber-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>SaaS Super Admin</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Module Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {menuSections.map(sec => {
          const visibleItems = sec.items.filter(item => !(isEmployeeOnly && item.hideForEmp));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.title}>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Natton Cloud</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">v2.5.0</span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar: Always visible on md: and above */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0 h-[calc(100vh-4rem)] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay: Only visible when isMobileSidebarOpen is true on mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
