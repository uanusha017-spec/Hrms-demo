import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { AppNotification } from '../../types/index.ts';
import {
  Building2,
  Bell,
  Smartphone,
  ChevronDown,
  UserCheck,
  Globe,
  ShieldAlert,
  Briefcase,
  Users,
  CreditCard,
  User,
  CheckCircle2,
  ExternalLink,
  Menu,
  LogOut,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenLanding: () => void }> = ({ onOpenLanding }) => {
  const {
    currentUser,
    currentTenant,
    currentMembership,
    accessibleTenants,
    switchTenant,
    switchPersona,
    activeRole,
    toggleMobileSimulator,
    toggleMobileSidebar,
    currentView,
    setCurrentView,
    logout
  } = useAuth();

  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT'
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000); // Poll every 12s
    return () => clearInterval(interval);
  }, [loadNotifications, currentTenant?.id, currentUser?.id]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    try {
      setIsSendingBroadcast(true);
      const res = await apiFetch('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: broadcastForm.title,
          message: broadcastForm.message,
          type: broadcastForm.type,
          target: 'ALL'
        })
      });

      setBroadcastForm({ title: '', message: '', type: 'INFO' });
      setIsBroadcastOpen(false);
      await loadNotifications();

      setToastMessage(`✓ Sent notification to all employees in ${currentTenant?.name || 'Natton Technology'}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const closeAllMenus = () => {
    setIsTenantMenuOpen(false);
    setIsPersonaMenuOpen(false);
    setIsNotifOpen(false);
  };

  const personas = [
    {
      userId: 'usr-superadmin',
      role: 'SUPER_ADMIN' as const,
      label: 'Platform Super Admin',
      name: 'Alexander Wright',
      desc: 'Global SaaS multi-tenant owner & billing manager',
      icon: ShieldAlert,
      color: 'text-amber-500'
    },
    {
      userId: 'usr-apex-admin',
      role: 'COMPANY_ADMIN' as const,
      label: 'Company Admin / CEO',
      name: 'Victoria Vance',
      desc: 'Executive ownership & company-wide control',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      userId: 'usr-apex-hr',
      role: 'HR_ADMIN' as const,
      label: 'HR Administrator',
      name: 'Elena Rostova',
      desc: 'People ops, leaves, recruitment, onboarding',
      icon: Users,
      color: 'text-emerald-500'
    },
    {
      userId: 'usr-apex-payroll',
      role: 'PAYROLL_ADMIN' as const,
      label: 'Payroll Administrator',
      name: 'Devin Kothari',
      desc: 'Salary structures, monthly pay runs, statutory',
      icon: CreditCard,
      color: 'text-indigo-500'
    },
    {
      userId: 'usr-apex-manager',
      role: 'DEPARTMENT_MANAGER' as const,
      label: 'Department Manager',
      name: 'David Sterling',
      desc: 'Team attendance, leave & expense approvals',
      icon: Briefcase,
      color: 'text-purple-500'
    },
    {
      userId: 'usr-apex-emp1',
      role: 'EMPLOYEE' as const,
      label: 'Employee Self-Service',
      name: 'Sarah Chen',
      desc: 'Web punch in/out, view payslip, apply leave',
      icon: User,
      color: 'text-teal-500'
    }
  ];

  const getShortRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'SuperAdmin';
      case 'COMPANY_ADMIN': return 'CEO / Admin';
      case 'HR_ADMIN': return 'HR';
      case 'PAYROLL_ADMIN': return 'Payroll';
      case 'DEPARTMENT_MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Staff';
      default: return role.replace('_', ' ');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Click-Away Backdrop for Menus */}
      {(isPersonaMenuOpen || isTenantMenuOpen || isNotifOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:bg-transparent"
          onClick={closeAllMenus}
        />
      )}

      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
        <div className="flex items-center justify-between px-2.5 sm:px-4 lg:px-6 h-14 sm:h-16 w-full max-w-full">
          {/* Left: Mobile Menu Toggle, Branding & Tenant Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setCurrentView('dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-blue-500/20 shrink-0">
                NT
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                  Natton<span className="text-blue-400 font-extrabold">Tech</span>
                </span>
                <span className="hidden xl:inline-flex px-1.5 py-0.5 text-[9px] font-semibold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-wider">
                  HRMS Cloud
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            {/* Tenant Switcher Dropdown - shown on md+ screens; accessible on mobile via drawer */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setIsTenantMenuOpen(!isTenantMenuOpen);
                  setIsPersonaMenuOpen(false);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm font-medium transition-all max-w-[170px] lg:max-w-[220px]"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="truncate text-slate-200">
                  {currentTenant?.name || 'Natton Technology'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isTenantMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Enterprise Tenant
                  </div>
                  <div className="space-y-1">
                    {accessibleTenants.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setIsTenantMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                          t.id === currentTenant?.id
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-medium text-slate-200">{t.name}</div>
                          <div className="text-xs text-slate-400">{t.country} • ₹ INR • {t.employeeCount} Staff</div>
                        </div>
                        {t.id === currentTenant?.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700/60 px-2">
                    <button
                      onClick={() => {
                        setIsTenantMenuOpen(false);
                        onOpenLanding();
                      }}
                      className="w-full text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 py-1.5 font-medium"
                    >
                      + Register New Company (SaaS Onboarding)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons & Live Persona Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Public SaaS portal button */}
            <button
              onClick={onOpenLanding}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition"
              title="View public SaaS pricing and onboarding"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>SaaS Portal</span>
            </button>

            {/* Mobile Simulator Launcher (desktop only) */}
            <button
              onClick={toggleMobileSimulator}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/60 transition shadow-sm"
              title="Launch Employee Mobile App Simulator"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Mobile App</span>
            </button>

            {/* Quick Persona / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsPersonaMenuOpen(!isPersonaMenuOpen);
                  setIsTenantMenuOpen(false);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/70 text-xs font-semibold text-blue-200 transition shrink-0 shadow-sm"
                title="Switch Live Role Perspective"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="hidden sm:inline text-slate-400 font-normal">Role:</span>
                <span className="text-white font-bold whitespace-nowrap hidden sm:inline">
                  {activeRole.replace('_', ' ')}
                </span>
                <span className="text-white font-bold whitespace-nowrap sm:hidden">
                  {getShortRole(activeRole)}
                </span>
                <ChevronDown className="w-3 h-3 text-blue-300 shrink-0" />
              </button>

              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Test Live Role Perspectives
                  </div>
                  <div className="space-y-1 max-h-[75vh] overflow-y-auto">
                    {personas.map(p => {
                      const Icon = p.icon;
                      const isSelected = activeRole === p.role;
                      return (
                        <button
                          key={p.userId}
                          onClick={() => {
                            switchPersona(p.userId, p.role);
                            setIsPersonaMenuOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200 shadow-sm'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg bg-slate-800 ${p.color} shrink-0 mt-0.5 border border-slate-700/50`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{p.label}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-slate-300 font-medium">{p.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsPersonaMenuOpen(false);
                  setIsTenantMenuOpen(false);
                  loadNotifications();
                }}
                className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative transition shrink-0"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-400" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600/30 text-blue-400 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Broadcast Button for Authorized Staff */}
                  <div className="mb-2.5">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        setIsBroadcastOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>+ Send Notification to All Employees</span>
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => {
                        const isAlert = n.type === 'ALERT' || n.type === 'WARNING';
                        return (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              !n.read
                                ? 'bg-slate-800/90 border-blue-500/40 shadow-sm'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    !n.read ? 'bg-blue-400' : 'bg-slate-600'
                                  }`}
                                />
                                <div className={`font-semibold text-xs truncate ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                                  {n.title}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed pl-3.5">
                              {n.message}
                            </p>

                            <div className="flex items-center justify-between mt-1.5 pl-3.5 pt-1 text-[10px]">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                                  n.type === 'SUCCESS'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : n.type === 'WARNING' || n.type === 'ALERT'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {n.type}
                              </span>

                              {!n.read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-800 shrink-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white border border-slate-600 shrink-0"
                title={currentUser ? `${currentUser.name} (${currentUser.email})` : 'User'}
              >
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'NT'}
              </div>
              <button
                onClick={logout}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition shrink-0"
                title="Sign out to Role Selection Screen"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Broadcast Notification Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span>Send Notification to All Employees</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcast will immediately alert all workforce members across all devices.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Target Audience
                </label>
                <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-xl text-blue-200 flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>All Active Employees in {currentTenant?.name || 'Natton Technology'} (Broadcast)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Town Hall Meeting at 3 PM / Holiday Notice"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Priority & Urgency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'INFO', label: 'Info', color: 'border-blue-500 text-blue-400' },
                    { id: 'SUCCESS', label: 'Success', color: 'border-emerald-500 text-emerald-400' },
                    { id: 'WARNING', label: 'Warning', color: 'border-amber-500 text-amber-400' },
                    { id: 'ALERT', label: 'Urgent', color: 'border-red-500 text-red-400' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBroadcastForm(prev => ({ ...prev, type: t.id as any }))}
                      className={`py-2 rounded-xl text-center font-bold border transition ${
                        broadcastForm.type === t.id
                          ? `bg-slate-800 ${t.color} shadow-sm`
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter detailed message to appear in the employee notification center..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingBroadcast ? 'Broadcasting...' : 'Broadcast to All Employees'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
