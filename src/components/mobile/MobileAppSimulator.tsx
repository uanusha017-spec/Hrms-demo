import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  Smartphone,
  X,
  Home,
  Clock,
  Calendar,
  IndianRupee,
  User,
  LogIn,
  LogOut,
  MapPin,
  Bell,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const MobileAppSimulator: React.FC = () => {
  const { currentTenant, isMobileSimulatorOpen, toggleMobileSimulator } = useAuth();
  const [mobileTab, setMobileTab] = useState<'HOME' | 'ATTENDANCE' | 'LEAVE' | 'PAYSLIP' | 'PROFILE'>('HOME');
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const employeeId = 'emp-apex-01';

  const loadData = async () => {
    try {
      const att = await apiFetch(`/attendance?date=2026-11-10&employeeId=${employeeId}`);
      if (att && att.length > 0) setAttendanceToday(att[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isMobileSimulatorOpen) loadData();
  }, [isMobileSimulatorOpen]);

  if (!isMobileSimulatorOpen) return null;

  const handleMobilePunch = async () => {
    try {
      setLoading(true);
      if (!attendanceToday?.checkIn) {
        await apiFetch('/attendance/check-in', {
          method: 'POST',
          body: JSON.stringify({
            employeeId,
            workMode: 'OFFICE',
            location: 'Mobile GPS: NYC-HQ (Verified Geofence)'
          })
        });
      } else {
        await apiFetch('/attendance/check-out', {
          method: 'POST',
          body: JSON.stringify({ employeeId })
        });
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Mobile punch error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative">
        {/* Close Button Outside Frame */}
        <button
          onClick={toggleMobileSimulator}
          className="absolute -top-10 right-0 text-white hover:text-slate-300 flex items-center gap-1.5 text-xs font-bold"
        >
          <span>Close Simulator</span>
          <X className="w-5 h-5" />
        </button>

        {/* Smartphone Hardware Frame */}
        <div className="w-[360px] h-[720px] bg-slate-950 rounded-[48px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative ring-8 ring-slate-900/50">
          {/* Top Notch / Dynamic Island */}
          <div className="h-7 bg-slate-950 flex items-center justify-center relative shrink-0">
            <div className="w-24 h-4 bg-black rounded-full" />
            <div className="absolute right-6 text-[10px] text-white font-mono font-bold">5G 100%</div>
            <div className="absolute left-6 text-[10px] text-white font-mono font-bold">9:41</div>
          </div>

          {/* App Screen Content */}
          <div className="flex-1 overflow-y-auto bg-slate-900 text-white text-xs p-4 space-y-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  NT
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{currentTenant?.name || 'Natton Technology'}</div>
                  <div className="text-[10px] text-slate-400">Sarah Chen • Staff</div>
                </div>
              </div>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            {mobileTab === 'HOME' && (
              <div className="space-y-3.5">
                {/* Punch In Card */}
                <div className="p-4 bg-gradient-to-tr from-slate-850 to-blue-950/60 border border-slate-800 rounded-2xl space-y-3 text-center">
                  <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
                    Location Geofence Verified
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {attendanceToday?.checkIn ? `In: ${attendanceToday.checkIn}` : 'Not Checked In'}
                  </div>

                  <button
                    onClick={handleMobilePunch}
                    disabled={loading || Boolean(attendanceToday?.checkOut)}
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                      !attendanceToday?.checkIn
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : !attendanceToday?.checkOut
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {!attendanceToday?.checkIn ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Tap to Check In (Office)</span>
                      </>
                    ) : !attendanceToday?.checkOut ? (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Tap to Check Out</span>
                      </>
                    ) : (
                      <span>Shift Finished (Logged: {attendanceToday.totalHours}h)</span>
                    )}
                  </button>
                </div>

                {/* Leave Balances Widget */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Leave Entitlements</span>
                    <span className="text-[10px] text-blue-400">Apply</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-slate-400">Casual</div>
                      <div className="text-sm font-bold text-blue-400 mt-0.5">8 Days</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-slate-400">Sick</div>
                      <div className="text-sm font-bold text-red-400 mt-0.5">10 Days</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-slate-400">Privilege</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">13 Days</div>
                    </div>
                  </div>
                </div>

                {/* Payslip Widget */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Latest Take-Home Pay</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">₹75,500.00</div>
                    <div className="text-[10px] text-slate-400">October 2026 Salary</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}

            {mobileTab === 'ATTENDANCE' && (
              <div className="space-y-3">
                <div className="font-bold text-white text-sm">Attendance History</div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Nov 10, 2026</span>
                    <span className="text-emerald-400 font-bold">PRESENT (08:58)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Nov 09, 2026</span>
                    <span className="text-emerald-400 font-bold">PRESENT (09:02)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Nov 08, 2026</span>
                    <span className="text-blue-400 font-bold">REMOTE (09:00)</span>
                  </div>
                </div>
              </div>
            )}

            {mobileTab === 'PAYSLIP' && (
              <div className="space-y-3">
                <div className="font-bold text-white text-sm">October 2026 Payslip</div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Basic Salary</span>
                    <span className="font-mono">₹45,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>HRA Allowance</span>
                    <span className="font-mono">₹22,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Special Allowance</span>
                    <span className="font-mono">₹15,000.00</span>
                  </div>
                  <div className="flex justify-between text-red-400 pt-1 border-t border-slate-800">
                    <span>PF & Tax Deductions</span>
                    <span className="font-mono">-₹7,000.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-xs pt-1 border-t border-slate-800">
                    <span>Net Disbursed</span>
                    <span className="font-mono">₹75,500.00</span>
                  </div>
                </div>
              </div>
            )}

            {mobileTab === 'PROFILE' && (
              <div className="space-y-3 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  SC
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Sarah Chen</div>
                  <div className="text-[11px] text-blue-400">Senior Full Stack Engineer</div>
                  <div className="text-[10px] text-slate-400">Employee ID: APX-1001</div>
                </div>
              </div>
            )}
          </div>

          {/* Native Mobile Bottom Navigation Bar */}
          <div className="h-16 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
            {[
              { id: 'HOME', label: 'Home', icon: Home },
              { id: 'ATTENDANCE', label: 'Clock', icon: Clock },
              { id: 'PAYSLIP', label: 'Payslip', icon: IndianRupee },
              { id: 'PROFILE', label: 'Profile', icon: User },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 transition ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* iOS Bottom Gesture Bar */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
