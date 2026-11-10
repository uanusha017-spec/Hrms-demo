import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  FileText,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  MapPin,
  Laptop,
  Building,
  Plus
} from 'lucide-react';

export const EmployeePortalDashboard: React.FC = () => {
  const { currentUser, currentTenant, setCurrentView } = useAuth();
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [leavesData, setLeavesData] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [workMode, setWorkMode] = useState<'OFFICE' | 'REMOTE' | 'HYBRID'>('OFFICE');
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real-time clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const employeeId = 'emp-apex-01'; // Default employee Sarah Chen

  const loadData = async () => {
    try {
      const [attRes, leaveRes, payrollRes, moduleRes] = await Promise.all([
        apiFetch(`/attendance?date=2026-11-10&employeeId=${employeeId}`),
        apiFetch(`/leaves/overview?employeeId=${employeeId}`),
        apiFetch(`/payroll/dashboard`),
        apiFetch('/modules/all')
      ]);

      if (attRes && attRes.length > 0) {
        setAttendanceToday(attRes[0]);
      } else {
        setAttendanceToday(null);
      }
      setLeavesData(leaveRes);
      setPayslips((payrollRes.payslips || []).filter((p: any) => p.employeeId === employeeId));
      setAnnouncements(moduleRes.announcements || []);
    } catch (err) {
      console.error('Failed to load employee self service data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handlePunchIn = async () => {
    try {
      setIsSubmittingPunch(true);
      await apiFetch('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          workMode,
          location: workMode === 'OFFICE' ? 'NYC-HQ Main Lobby' : 'Remote Verified'
        })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to punch in');
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setIsSubmittingPunch(true);
      await apiFetch('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ employeeId })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to punch out');
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Employee Self-Service Portal</div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome back, {currentUser?.name || 'Sarah Chen'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Senior Full Stack Engineer • Software Engineering • ID: APX-1001
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
              <div className="text-lg font-mono font-bold text-white">{currentTime}</div>
              <div className="text-[10px] text-slate-400">Tuesday, Nov 10, 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance Check In/Out & Leave Balance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Action Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Today's Attendance Punch</span>
            </h2>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              attendanceToday?.checkIn
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {attendanceToday?.checkIn ? 'PUNCHED IN' : 'NOT CLOCKED IN'}
            </span>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Working Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'OFFICE', label: 'Office', icon: Building },
                { id: 'REMOTE', label: 'Remote', icon: Laptop },
                { id: 'HYBRID', label: 'Hybrid', icon: MapPin },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = workMode === m.id;
                return (
                  <button
                    key={m.id}
                    disabled={Boolean(attendanceToday?.checkIn)}
                    onClick={() => setWorkMode(m.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Punch Metrics Display */}
          <div className="grid grid-cols-2 gap-3 py-2 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Clock In</div>
              <div className="text-base font-bold text-white mt-0.5">
                {attendanceToday?.checkIn || '--:--'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Clock Out</div>
              <div className="text-base font-bold text-white mt-0.5">
                {attendanceToday?.checkOut || '--:--'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {!attendanceToday?.checkIn ? (
              <button
                onClick={handlePunchIn}
                disabled={isSubmittingPunch}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Web Check-In</span>
              </button>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={handlePunchOut}
                disabled={isSubmittingPunch}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Web Check-Out</span>
              </button>
            ) : (
              <div className="text-center py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
                ✓ Shift Completed for Today ({attendanceToday.totalHours} hrs logged)
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Leave Balances (2026)</span>
            </h2>
            <button
              onClick={() => setCurrentView('leave')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>

          <div className="space-y-3">
            {(leavesData?.balances || []).slice(0, 3).map((b: any) => (
              <div key={b.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{b.leaveTypeName}</span>
                  <span className="font-bold text-emerald-400">{b.available} Days Available</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(b.available / (b.allocated || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Used: {b.used} days</span>
                  <span>Pending: {b.pending} days</span>
                  <span>Total: {b.allocated} days</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('leave')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            View Leave History & Approvals →
          </button>
        </div>

        {/* Latest Payslip Quick Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-400" />
                <span>Latest Payslip</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                OCTOBER 2026
              </span>
            </div>

            {payslips.length > 0 ? (
              <div className="mt-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Net Take-Home Pay</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ₹{payslips[0].netSalary.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Gross Earnings:</span>
                    <span>₹{payslips[0].grossSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Deductions (PF/Tax):</span>
                    <span>-₹{payslips[0].totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No payslip generated yet.</div>
            )}
          </div>

          <button
            onClick={() => setCurrentView('payroll')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official Payslip PDF</span>
          </button>
        </div>
      </div>

      {/* Company Announcements Bulletin */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Company Announcements & Notice Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((a: any) => (
            <div key={a.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">{a.title}</span>
                {a.pinned && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    PINNED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
              <div className="text-[10px] text-slate-400 pt-1">Posted by {a.authorName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
