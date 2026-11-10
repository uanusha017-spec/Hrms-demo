import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { CompanyAdminDashboard } from './components/dashboard/CompanyAdminDashboard.tsx';
import { EmployeePortalDashboard } from './components/dashboard/EmployeePortalDashboard.tsx';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard.tsx';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory.tsx';
import { OrganizationView } from './components/organization/OrganizationView.tsx';
import { AttendanceView } from './components/attendance/AttendanceView.tsx';
import { LeaveManagementView } from './components/leave/LeaveManagementView.tsx';
import { PayrollView } from './components/payroll/PayrollView.tsx';
import { RecruitmentView } from './components/recruitment/RecruitmentView.tsx';
import { OnboardingView } from './components/onboarding/OnboardingView.tsx';
import { PerformanceView } from './components/performance/PerformanceView.tsx';
import { ExpensesView } from './components/expenses/ExpensesView.tsx';
import { AssetsView } from './components/assets/AssetsView.tsx';
import { HelpdeskView } from './components/helpdesk/HelpdeskView.tsx';
import { ExitManagementView } from './components/exit/ExitManagementView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { BillingSubscriptionView } from './components/billing/BillingSubscriptionView.tsx';
import { MobileAppSimulator } from './components/mobile/MobileAppSimulator.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';

import { LoginPage } from './components/auth/LoginPage.tsx';

const AppContent: React.FC = () => {
  const { currentView, activeRole, isLoading, isAuthenticated } = useAuth();
  const [isLandingOpen, setIsLandingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Initializing Multi-Tenant Isolation & HRMS Core...
          </span>
        </div>
      </div>
    );
  }

  // Initial Entry Page: Role-based Enterprise Authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <LoginPage onOpenRegister={() => setIsLandingOpen(true)} />
        {isLandingOpen && <LandingPage onClose={() => setIsLandingOpen(false)} />}
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (activeRole === 'EMPLOYEE') return <EmployeePortalDashboard />;
        if (activeRole === 'SUPER_ADMIN') return <SuperAdminDashboard onOpenLanding={() => setIsLandingOpen(true)} />;
        return <CompanyAdminDashboard />;

      case 'employees':
        return <EmployeeDirectory />;

      case 'organization':
        return <OrganizationView />;

      case 'attendance':
        return <AttendanceView />;

      case 'leave':
        return <LeaveManagementView />;

      case 'payroll':
        return <PayrollView />;

      case 'recruitment':
        return <RecruitmentView />;

      case 'onboarding':
        return <OnboardingView />;

      case 'performance':
        return <PerformanceView />;

      case 'expenses':
      case 'timesheets':
        return <ExpensesView />;

      case 'assets':
        return <AssetsView />;

      case 'helpdesk':
      case 'engagement':
        return <HelpdeskView />;

      case 'offboarding':
        return <ExitManagementView />;

      case 'reports':
        return <ReportsView />;

      case 'billing':
        return <BillingSubscriptionView />;

      case 'superadmin':
        return <SuperAdminDashboard onOpenLanding={() => setIsLandingOpen(true)} />;

      default:
        return <CompanyAdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenLanding={() => setIsLandingOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950/95">
          {renderView()}
        </main>
      </div>

      {/* Interactive Mobile Device Simulator */}
      <MobileAppSimulator />

      {/* Public SaaS Onboarding & Pricing Curtain */}
      {isLandingOpen && <LandingPage onClose={() => setIsLandingOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
