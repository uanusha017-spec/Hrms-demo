import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { Employee, Department, Designation, Branch } from '../../types/index.ts';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Building,
  Briefcase,
  Mail,
  Phone,
  Eye,
  Edit2,
  X,
  CheckCircle2
} from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { currentTenant } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    branchId: '',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-11-10',
    ctcAnnual: '120000',
    basicMonthly: '5000',
    hraMonthly: '2500',
    specialAllowanceMonthly: '2000',
    conveyanceMonthly: '500'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, orgRes] = await Promise.all([
        apiFetch('/employees'),
        apiFetch('/organization/all')
      ]);
      setEmployees(empRes);
      setDepartments(orgRes.departments || []);
      setDesignations(orgRes.designations || []);
      setBranches(orgRes.branches || []);

      if (orgRes.departments?.length > 0) {
        setFormData(prev => ({
          ...prev,
          departmentId: orgRes.departments[0].id,
          designationId: orgRes.designations[0]?.id || '',
          branchId: orgRes.branches[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const basic = Number(formData.basicMonthly) || 5000;
      const hra = Number(formData.hraMonthly) || 2500;
      const special = Number(formData.specialAllowanceMonthly) || 2000;
      const conveyance = Number(formData.conveyanceMonthly) || 500;
      const ctc = Number(formData.ctcAnnual) || (basic + hra + special + conveyance) * 12;

      await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          salaryDetails: {
            ctcAnnual: ctc,
            basicMonthly: basic,
            hraMonthly: hra,
            specialAllowanceMonthly: special,
            conveyanceMonthly: conveyance,
            pfApplicable: true,
            esiApplicable: false,
            ptApplicable: true,
            taxRegime: 'NEW'
          }
        })
      });

      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept ? e.departmentId === selectedDept : true;
    const matchStatus = selectedStatus ? e.status === selectedStatus : true;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage comprehensive workforce profiles, compensation structures, and departmental designations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/export/employees"
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Employment Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PROBATION">PROBATION</option>
            <option value="NOTICE_PERIOD">NOTICE PERIOD</option>
            <option value="OFFBOARDED">OFFBOARDED</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: Shows ALL Columns in High-Clarity Cards (No Horizontal Clipping) */}
        <div className="lg:hidden divide-y divide-slate-800/80">
          {filteredEmployees.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No employees matching the active filter criteria.
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <div key={emp.id} className="p-4 space-y-3 bg-slate-900/60 hover:bg-slate-800/40 transition">
                {/* Header: Employee Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-blue-400 font-mono">{emp.employeeNumber}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    emp.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : emp.status === 'PROBATION'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Role, Department & Work Mode (All Columns) */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Designation & Team</div>
                    <div className="text-slate-200 font-medium mt-0.5">{emp.designationTitle}</div>
                    <div className="text-[10px] text-slate-400">{emp.departmentName}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Branch & Mode</div>
                    <div className="text-slate-200 font-medium mt-0.5">{emp.branchName}</div>
                    <span className="inline-block mt-0.5 text-[9px] font-semibold text-blue-300 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/40">
                      {emp.workMode}
                    </span>
                  </div>
                </div>

                {/* Contact Info (Email & Phone) */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Corporate Contact</div>
                    <div className="text-slate-300 truncate">{emp.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 font-mono">{emp.phone}</div>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
                >
                  View Complete Profile & Compensation →
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Data Table with Horizontal Scroll Guard */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Location / Work Mode</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No employees matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[10px] text-blue-400 font-mono">{emp.employeeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{emp.designationTitle}</div>
                      <div className="text-[10px] text-slate-400">{emp.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{emp.branchName}</div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {emp.workMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 truncate max-w-[160px]">{emp.email}</div>
                      <div className="text-[10px] text-slate-400">{emp.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : emp.status === 'PROBATION'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold border border-slate-700 transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Register New Employee</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Work Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Designation</label>
                  <select
                    value={formData.designationId}
                    onChange={e => setFormData({ ...formData, designationId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {designations.map(des => (
                      <option key={des.id} value={des.id}>{des.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Branch HQ</label>
                  <select
                    value={formData.branchId}
                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="OFFICE">Office</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-blue-400">Monthly Compensation Structure (USD)</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400">Basic Pay</label>
                    <input
                      type="number"
                      value={formData.basicMonthly}
                      onChange={e => setFormData({ ...formData, basicMonthly: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">HRA</label>
                    <input
                      type="number"
                      value={formData.hraMonthly}
                      onChange={e => setFormData({ ...formData, hraMonthly: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Special Allowance</label>
                    <input
                      type="number"
                      value={formData.specialAllowanceMonthly}
                      onChange={e => setFormData({ ...formData, specialAllowanceMonthly: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Conveyance</label>
                    <input
                      type="number"
                      value={formData.conveyanceMonthly}
                      onChange={e => setFormData({ ...formData, conveyanceMonthly: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Profile Drawer */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <div className="text-xs text-blue-400 font-mono">{selectedEmployee.employeeNumber}</div>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400">Department:</div>
                  <div className="text-white font-medium">{selectedEmployee.departmentName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Designation:</div>
                  <div className="text-white font-medium">{selectedEmployee.designationTitle}</div>
                </div>
                <div>
                  <div className="text-slate-400">Work Mode:</div>
                  <div className="text-white font-medium">{selectedEmployee.workMode}</div>
                </div>
                <div>
                  <div className="text-slate-400">Joining Date:</div>
                  <div className="text-white font-medium">{selectedEmployee.joiningDate}</div>
                </div>
              </div>

              {selectedEmployee.salaryDetails && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-emerald-400">Compensation Breakdown</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Annual CTC: ${selectedEmployee.salaryDetails.ctcAnnual.toLocaleString()}</div>
                    <div>Basic Monthly: ${selectedEmployee.salaryDetails.basicMonthly.toLocaleString()}</div>
                    <div>HRA: ${selectedEmployee.salaryDetails.hraMonthly.toLocaleString()}</div>
                    <div>Special: ${selectedEmployee.salaryDetails.specialAllowanceMonthly.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
