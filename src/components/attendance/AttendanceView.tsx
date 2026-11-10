import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { AttendanceRecord, Shift } from '../../types/index.ts';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Download,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building,
  Laptop
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentTenant, activeRole } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-11-10');
  const [activeTab, setActiveTab] = useState<'DAILY' | 'SHIFTS'>('DAILY');

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, shiftRes] = await Promise.all([
        apiFetch(`/attendance?date=${selectedDate}`),
        apiFetch('/attendance/shifts')
      ]);
      setAttendance(attRes);
      setShifts(shiftRes);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id, selectedDate]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Workforce Attendance & Shifts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric, web, and mobile punches with geofence verification and overnight shift support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('DAILY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'DAILY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Attendance Sheet
            </button>
            <button
              onClick={() => setActiveTab('SHIFTS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'SHIFTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Shift Policies & Rosters
            </button>
          </div>

          <a
            href="/api/v1/export/attendance"
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {activeTab === 'DAILY' ? (
        <div className="space-y-4">
          {/* Date Selector & Stats */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-300">Selected Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-emerald-400">Present: {attendance.filter(a => a.status === 'PRESENT').length}</span>
              <span className="text-amber-400">Late Arrivals: {attendance.filter(a => a.status === 'LATE').length}</span>
              <span className="text-blue-400">On Leave: {attendance.filter(a => a.status === 'ON_LEAVE').length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
            <div className="lg:hidden divide-y divide-slate-800/80">
              {attendance.map(a => (
                <div key={a.id} className="p-4 space-y-2.5 bg-slate-900/60 hover:bg-slate-800/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{a.employeeName}</div>
                      <div className="text-[10px] text-blue-400 font-mono mt-0.5">{a.employeeNumber}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === 'PRESENT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : a.status === 'LATE'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : a.status === 'ON_LEAVE'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  {/* Punch Timings & Hours */}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/60">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Check In</div>
                      <div className="text-white font-mono font-medium mt-0.5">
                        {a.checkIn || '--:--'}
                      </div>
                      {a.lateMinutes > 0 && (
                        <div className="text-[9px] text-amber-400 font-bold">+{a.lateMinutes}m late</div>
                      )}
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Check Out</div>
                      <div className="text-white font-mono font-medium mt-0.5">
                        {a.checkOut || (a.checkIn ? 'In Progress' : '--:--')}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Total Hours</div>
                      <div className="text-emerald-400 font-mono font-bold mt-0.5">
                        {a.totalHours > 0 ? `${a.totalHours} hrs` : '--'}
                      </div>
                    </div>
                  </div>

                  {/* Location Column */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{a.location || 'Office Headquarter'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Data Table with Min Width Guard */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Total Logged</th>
                    <th className="py-3 px-4">Work Mode / Location</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attendance.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{a.employeeName}</div>
                        <div className="text-[10px] text-blue-400 font-mono">{a.employeeNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                        {a.checkIn || '--:--'}
                        {a.lateMinutes > 0 && (
                          <span className="ml-1.5 text-[10px] text-amber-400 font-sans">
                            (+{a.lateMinutes}m)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                        {a.checkOut || (a.checkIn ? 'In Progress' : '--:--')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {a.totalHours > 0 ? `${a.totalHours} hrs` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{a.location || 'Office Headquarter'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : a.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : a.status === 'ON_LEAVE'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Shifts Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{s.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  {s.code}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Timing:</span>
                  <span className="font-mono font-bold text-white">{s.startTime} - {s.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grace Period:</span>
                  <span>{s.graceMinutes} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Half Day Cutoff:</span>
                  <span>{s.halfDayHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shift Type:</span>
                  <span className={s.isOvernight ? 'text-purple-400 font-semibold' : 'text-slate-300'}>
                    {s.isOvernight ? 'Overnight Shift' : 'Standard Day'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
