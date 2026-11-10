import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  Payslip,
  JobOpening,
  Candidate,
  OnboardingTask,
  PerformanceGoal,
  ExpenseClaim,
  Asset,
  HelpdeskTicket,
  Announcement,
  Resignation,
  Tenant,
  User,
  TenantMembership,
  Department,
  Branch,
  Designation,
  AppNotification
} from '../src/types/index.ts';

export const apiRouter = Router();

// Tenant context middleware
export interface AuthenticatedRequest extends Request {
  currentTenant?: Tenant;
  currentUser?: User;
  currentMembership?: TenantMembership;
}

apiRouter.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-apex';
  const userId = (req.headers['x-user-id'] as string) || 'usr-apex-admin';

  const tenants = db.get('tenants');
  const users = db.get('users');
  const memberships = db.get('memberships');

  req.currentTenant = tenants.find(t => t.id === tenantId) || tenants[0];
  req.currentUser = users.find(u => u.id === userId) || users[1];
  req.currentMembership = memberships.find(m => m.tenantId === req.currentTenant?.id && m.userId === req.currentUser?.id) || {
    id: 'mem-fallback',
    tenantId: req.currentTenant?.id || 'tenant-apex',
    userId: req.currentUser?.id || 'usr-apex-admin',
    role: req.currentUser?.isSuperAdmin ? 'SUPER_ADMIN' : 'COMPANY_ADMIN',
    permissions: ['*'],
    status: 'ACTIVE',
    joinedAt: new Date().toISOString()
  };

  next();
});

// ==========================================
// 1. AUTH & TENANT SWITCHING & REGISTRATION
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, tenantId } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const users = db.get('users');
  const tenants = db.get('tenants');
  const memberships = db.get('memberships');

  // Find user by email or by id
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.id === email);

  // If not found, create a demo user
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/^./, (str: string) => str.toUpperCase()),
      isSuperAdmin: email.includes('admin')
    };
    users.push(user);
    db.set('users', users);
  }

  // Determine active tenant
  let tenant = tenants.find(t => t.id === tenantId);
  if (!tenant) {
    // Check memberships
    const userMem = memberships.find(m => m.userId === user?.id);
    if (userMem) {
      tenant = tenants.find(t => t.id === userMem.tenantId);
    }
  }
  if (!tenant) {
    tenant = tenants[0]; // Natton Technology
  }

  // Find or create membership
  let membership = memberships.find(m => m.tenantId === tenant?.id && m.userId === user?.id);
  if (!membership) {
    membership = {
      id: `mem-${Date.now()}`,
      tenantId: tenant.id,
      userId: user.id,
      role: user.isSuperAdmin ? 'SUPER_ADMIN' : 'COMPANY_ADMIN',
      permissions: ['*'],
      status: 'ACTIVE',
      joinedAt: new Date().toISOString()
    };
    memberships.push(membership);
    db.set('memberships', memberships);
  }

  const token = `jwt_session_${Date.now()}_${user.id}`;
  db.logAudit(tenant.id, user.id, user.name, 'USER_LOGIN', 'User', user.id, `${user.name} signed in successfully via ${membership.role}`);

  res.json({
    success: true,
    token,
    user,
    tenant,
    membership
  });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  const users = db.get('users');
  const tenants = db.get('tenants');
  const memberships = db.get('memberships');

  const userMemberships = memberships.filter(m => m.userId === req.currentUser?.id);
  const userTenants = tenants.filter(t => userMemberships.some(m => m.tenantId === t.id));

  res.json({
    user: req.currentUser,
    tenant: req.currentTenant,
    membership: req.currentMembership,
    accessibleTenants: userTenants.length > 0 ? userTenants : tenants,
    allUsersForPersonaSwitcher: users
  });
});

apiRouter.post('/auth/register-company', (req: Request, res: Response) => {
  const {
    companyName,
    companyEmail,
    contactPerson,
    phone,
    country,
    state,
    city,
    planId,
    currency,
    timezone,
    employeeRange
  } = req.body;

  if (!companyName || !companyEmail || !contactPerson) {
    return res.status(400).json({ error: 'Company name, email, and contact person are required.' });
  }

  const tenants = db.get('tenants');
  const users = db.get('users');
  const memberships = db.get('memberships');
  const branches = db.get('branches');
  const departments = db.get('departments');
  const designations = db.get('designations');
  const employees = db.get('employees');
  const leaveTypes = db.get('leaveTypes');

  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const tenantId = `tenant-${Date.now()}`;
  const userId = `usr-${Date.now()}`;
  const employeeId = `emp-${Date.now()}-01`;

  // 1. Create Tenant
  const newTenant: Tenant = {
    id: tenantId,
    name: companyName,
    slug: `${slug}-${Math.floor(Math.random() * 899 + 100)}`,
    planId: planId || 'STARTER',
    status: 'TRIAL',
    currency: currency || 'INR',
    timezone: timezone || 'Asia/Kolkata',
    country: country || 'India',
    employeeCount: 1,
    maxEmployees: planId === 'BUSINESS' ? 100 : planId === 'GROWTH' ? 50 : 20,
    createdAt: new Date().toISOString(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    brandColor: '#2563EB',
    whiteLabel: { enabled: false }
  };
  tenants.push(newTenant);
  db.set('tenants', tenants);

  // 2. Create User (Company Owner)
  const names = contactPerson.split(' ');
  const firstName = names[0] || 'Admin';
  const lastName = names.slice(1).join(' ') || 'User';

  const newUser: User = {
    id: userId,
    email: companyEmail,
    name: contactPerson,
    isSuperAdmin: false
  };
  users.push(newUser);
  db.set('users', users);

  // 3. Create Default HQ Branch
  const branchId = `br-${Date.now()}`;
  const newBranch: Branch = {
    id: branchId,
    tenantId,
    name: 'Headquarters',
    code: 'HQ-01',
    city: city || 'Bengaluru',
    state: state || 'Karnataka',
    country: country || 'India',
    isHeadquarters: true
  };
  branches.push(newBranch);
  db.set('branches', branches);

  // 4. Create Standard Departments
  const deptExec: Department = { id: `dept-${Date.now()}-1`, tenantId, branchId, name: 'Executive Leadership', code: 'EXEC' };
  const deptEng: Department = { id: `dept-${Date.now()}-2`, tenantId, branchId, name: 'Engineering', code: 'ENG' };
  const deptHR: Department = { id: `dept-${Date.now()}-3`, tenantId, branchId, name: 'Human Resources', code: 'HR' };
  departments.push(deptExec, deptEng, deptHR);
  db.set('departments', departments);

  // 5. Create Default Designations
  const desCEO: Designation = { id: `des-${Date.now()}-1`, tenantId, departmentId: deptExec.id, title: 'Managing Director & CEO', level: 'L10', minSalary: 150000, maxSalary: 300000 };
  const desHRM: Designation = { id: `des-${Date.now()}-2`, tenantId, departmentId: deptHR.id, title: 'HR Manager', level: 'L5', minSalary: 75000, maxSalary: 110000 };
  designations.push(desCEO, desHRM);
  db.set('designations', designations);

  // 6. Create First Employee Record (CEO)
  const newEmployee: Employee = {
    id: employeeId,
    tenantId,
    userId,
    employeeNumber: 'EMP-001',
    firstName,
    lastName,
    email: companyEmail,
    phone: phone || '+1 (555) 000-0000',
    departmentId: deptExec.id,
    departmentName: deptExec.name,
    designationId: desCEO.id,
    designationTitle: desCEO.title,
    branchId: newBranch.id,
    branchName: newBranch.name,
    employmentType: 'FULL_TIME',
    workMode: 'OFFICE',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    salaryDetails: {
      ctcAnnual: 180000,
      basicMonthly: 7500,
      hraMonthly: 3750,
      specialAllowanceMonthly: 3000,
      conveyanceMonthly: 750,
      pfApplicable: true,
      esiApplicable: false,
      ptApplicable: true,
      taxRegime: 'NEW'
    }
  };
  employees.push(newEmployee);
  db.set('employees', employees);

  // 7. Create Membership
  const newMembership: TenantMembership = {
    id: `mem-${Date.now()}`,
    tenantId,
    userId,
    employeeId,
    role: 'COMPANY_ADMIN',
    permissions: ['*'],
    status: 'ACTIVE',
    joinedAt: new Date().toISOString()
  };
  memberships.push(newMembership);
  db.set('memberships', memberships);

  // 8. Seed Default Leave Policies
  leaveTypes.push(
    { id: `lt-${Date.now()}-cl`, tenantId, name: 'Casual Leave (CL)', code: 'CL', daysPerYear: 12, carryForwardMax: 3, isUnpaid: false, color: '#3B82F6' },
    { id: `lt-${Date.now()}-sl`, tenantId, name: 'Sick Leave (SL)', code: 'SL', daysPerYear: 12, carryForwardMax: 0, isUnpaid: false, color: '#EF4444' },
    { id: `lt-${Date.now()}-pl`, tenantId, name: 'Paid Vacation (PL)', code: 'PL', daysPerYear: 18, carryForwardMax: 10, isUnpaid: false, color: '#10B981' }
  );
  db.set('leaveTypes', leaveTypes);

  // Log Audit
  db.logAudit(tenantId, userId, contactPerson, 'COMPANY_REGISTERED', 'Tenant', tenantId, `Provisioned company ${companyName} on plan ${planId || 'STARTER'}`);

  res.status(201).json({
    success: true,
    message: 'Company registered successfully. Tenant organization and administrator account provisioned.',
    tenant: newTenant,
    user: newUser,
    membership: newMembership
  });
});

// Update Tenant settings & white labeling
apiRouter.patch('/tenants/current', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id;
  const tenants = db.get('tenants');
  const index = tenants.findIndex(t => t.id === tenantId);
  if (index === -1) return res.status(404).json({ error: 'Tenant not found' });

  const updated = {
    ...tenants[index],
    ...req.body,
    id: tenantId // immutable
  };
  tenants[index] = updated;
  db.set('tenants', tenants);

  db.logAudit(tenantId!, req.currentUser!.id, req.currentUser!.name, 'TENANT_SETTINGS_UPDATED', 'Tenant', tenantId!, 'Updated company profile and settings');
  res.json(updated);
});

// ==========================================
// 2. DASHBOARD & KPIS
// ==========================================

apiRouter.get('/dashboard/kpis', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const attendance = db.get('attendance').filter(a => a.tenantId === tenantId && a.date === '2026-11-10');
  const leaveRequests = db.get('leaveRequests').filter(l => l.tenantId === tenantId);
  const departments = db.get('departments').filter(d => d.tenantId === tenantId);
  const jobOpenings = db.get('jobOpenings').filter(j => j.tenantId === tenantId && j.status === 'ACTIVE');
  const payrollRuns = db.get('payrollRuns').filter(p => p.tenantId === tenantId);

  const activeEmployees = employees.filter(e => e.status === 'ACTIVE' || e.status === 'PROBATION');
  const presentToday = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateToday = attendance.filter(a => a.status === 'LATE').length;
  const onLeaveToday = attendance.filter(a => a.status === 'ON_LEAVE').length;
  const absentToday = Math.max(0, activeEmployees.length - presentToday - onLeaveToday);
  const pendingApprovals = leaveRequests.filter(l => l.status === 'PENDING').length;

  const latestPayroll = payrollRuns[payrollRuns.length - 1];

  res.json({
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    presentToday,
    lateToday,
    onLeaveToday,
    absentToday,
    departmentCount: departments.length,
    openPositions: jobOpenings.reduce((sum, j) => sum + j.openings, 0),
    pendingLeaveApprovals: pendingApprovals,
    payrollStatus: latestPayroll ? latestPayroll.status : 'NOT_INITIATED',
    latestPayrollMonth: latestPayroll ? `${latestPayroll.month}/${latestPayroll.year}` : 'N/A',
    latestPayrollCost: latestPayroll ? latestPayroll.totalGross : 0
  });
});

// ==========================================
// 3. ORGANIZATION: BRANCHES, DEPTS, ROLES
// ==========================================

apiRouter.get('/organization/all', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json({
    branches: db.get('branches').filter(b => b.tenantId === tenantId),
    departments: db.get('departments').filter(d => d.tenantId === tenantId),
    designations: db.get('designations').filter(des => des.tenantId === tenantId)
  });
});

apiRouter.post('/organization/departments', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { name, code, branchId, managerId, budget } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and Code are required' });

  const depts = db.get('departments');
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    tenantId,
    name,
    code: code.toUpperCase(),
    branchId,
    managerId,
    budget: Number(budget) || 0
  };
  depts.push(newDept);
  db.set('departments', depts);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'DEPARTMENT_CREATED', 'Department', newDept.id, `Created department ${name}`);
  res.status(201).json(newDept);
});

apiRouter.post('/organization/branches', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { name, code, city, state, country, isHeadquarters } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and Code are required' });

  const branches = db.get('branches');
  const newBranch: Branch = {
    id: `br-${Date.now()}`,
    tenantId,
    name,
    code: code.toUpperCase(),
    city: city || '',
    state: state || '',
    country: country || 'United States',
    isHeadquarters: Boolean(isHeadquarters)
  };
  branches.push(newBranch);
  db.set('branches', branches);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'BRANCH_CREATED', 'Branch', newBranch.id, `Created branch ${name}`);
  res.status(201).json(newBranch);
});

apiRouter.post('/organization/designations', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { departmentId, title, level, minSalary, maxSalary } = req.body;
  if (!departmentId || !title) return res.status(400).json({ error: 'Department and Title are required' });

  const designations = db.get('designations');
  const newDes: Designation = {
    id: `des-${Date.now()}`,
    tenantId,
    departmentId,
    title,
    level: level || 'L3',
    minSalary: Number(minSalary) || 50000,
    maxSalary: Number(maxSalary) || 90000
  };
  designations.push(newDes);
  db.set('designations', designations);

  res.status(201).json(newDes);
});

// ==========================================
// 4. EMPLOYEE MANAGEMENT
// ==========================================

apiRouter.get('/employees', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { search, departmentId, status, workMode } = req.query;

  let employees = db.get('employees').filter(e => e.tenantId === tenantId);

  if (search) {
    const q = (search as string).toLowerCase();
    employees = employees.filter(e =>
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.employeeNumber.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  }

  if (departmentId) {
    employees = employees.filter(e => e.departmentId === departmentId);
  }

  if (status) {
    employees = employees.filter(e => e.status === status);
  }

  if (workMode) {
    employees = employees.filter(e => e.workMode === workMode);
  }

  res.json(employees);
});

apiRouter.post('/employees', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const payload = req.body;

  if (!payload.firstName || !payload.lastName || !payload.email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  const employees = db.get('employees');
  const departments = db.get('departments').filter(d => d.tenantId === tenantId);
  const designations = db.get('designations').filter(des => des.tenantId === tenantId);
  const branches = db.get('branches').filter(b => b.tenantId === tenantId);

  const dept = departments.find(d => d.id === payload.departmentId);
  const des = designations.find(d => d.id === payload.designationId);
  const branch = branches.find(b => b.id === payload.branchId);

  const empNumber = payload.employeeNumber || `APX-${1000 + employees.length + 1}`;
  const newEmp: Employee = {
    id: `emp-${Date.now()}`,
    tenantId,
    employeeNumber: empNumber,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone || '',
    departmentId: payload.departmentId || departments[0]?.id || '',
    departmentName: dept?.name || 'General',
    designationId: payload.designationId || designations[0]?.id || '',
    designationTitle: des?.title || 'Team Member',
    branchId: payload.branchId || branches[0]?.id || '',
    branchName: branch?.name || 'Headquarters',
    reportingManagerId: payload.reportingManagerId || '',
    reportingManagerName: payload.reportingManagerName || '',
    employmentType: payload.employmentType || 'FULL_TIME',
    workMode: payload.workMode || 'HYBRID',
    joiningDate: payload.joiningDate || new Date().toISOString().split('T')[0],
    status: payload.status || 'ACTIVE',
    dob: payload.dob,
    gender: payload.gender || 'PREFER_NOT_TO_SAY',
    address: payload.address,
    bankDetails: payload.bankDetails,
    salaryDetails: payload.salaryDetails || {
      ctcAnnual: 100000,
      basicMonthly: 4166,
      hraMonthly: 2083,
      specialAllowanceMonthly: 1667,
      conveyanceMonthly: 416,
      pfApplicable: true,
      esiApplicable: false,
      ptApplicable: true,
      taxRegime: 'NEW'
    }
  };

  employees.push(newEmp);
  db.set('employees', employees);

  // Initialize leave balances for the new employee
  const leaveTypes = db.get('leaveTypes').filter(lt => lt.tenantId === tenantId);
  const balances = db.get('leaveBalances');
  leaveTypes.forEach(lt => {
    balances.push({
      id: `lb-${Date.now()}-${lt.id}`,
      tenantId,
      employeeId: newEmp.id,
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      color: lt.color,
      allocated: lt.daysPerYear,
      used: 0,
      pending: 0,
      available: lt.daysPerYear
    });
  });
  db.set('leaveBalances', balances);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'EMPLOYEE_CREATED', 'Employee', newEmp.id, `Created employee record ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeNumber})`);

  res.status(201).json(newEmp);
});

apiRouter.patch('/employees/:id', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;
  const employees = db.get('employees');
  const index = employees.findIndex(e => e.id === id && e.tenantId === tenantId);

  if (index === -1) return res.status(404).json({ error: 'Employee not found' });

  const updated: Employee = {
    ...employees[index],
    ...req.body,
    id,
    tenantId // prevent re-assigning tenant
  };

  employees[index] = updated;
  db.set('employees', employees);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'EMPLOYEE_UPDATED', 'Employee', id, `Updated employee ${updated.firstName} ${updated.lastName}`);
  res.json(updated);
});

// ==========================================
// 5. ATTENDANCE & SHIFTS
// ==========================================

apiRouter.get('/attendance', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { date, employeeId } = req.query;

  let records = db.get('attendance').filter(a => a.tenantId === tenantId);
  if (date) {
    records = records.filter(a => a.date === date);
  }
  if (employeeId) {
    records = records.filter(a => a.employeeId === employeeId);
  }

  res.json(records);
});

apiRouter.post('/attendance/check-in', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId, workMode, location } = req.body;

  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const emp = employees.find(e => e.id === employeeId) || employees[0];
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const attendance = db.get('attendance');
  const today = '2026-11-10'; // synchronized platform date
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const existingIdx = attendance.findIndex(a => a.tenantId === tenantId && a.employeeId === emp.id && a.date === today);

  if (existingIdx !== -1 && attendance[existingIdx].checkIn) {
    return res.status(400).json({ error: 'Already checked in for today.' });
  }

  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
  const lateMins = isLate ? (now.getHours() - 9) * 60 + now.getMinutes() : 0;

  const record: AttendanceRecord = {
    id: `att-${Date.now()}`,
    tenantId,
    employeeId: emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    employeeNumber: emp.employeeNumber,
    date: today,
    checkIn: timeStr,
    checkOut: null,
    workMode: workMode || 'OFFICE',
    status: isLate ? 'LATE' : 'PRESENT',
    lateMinutes: lateMins,
    overtimeMinutes: 0,
    totalHours: 0,
    location: location || 'Verified Web Punch'
  };

  if (existingIdx !== -1) {
    attendance[existingIdx] = record;
  } else {
    attendance.unshift(record);
  }

  db.set('attendance', attendance);
  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'ATTENDANCE_CHECKIN', 'Attendance', record.id, `${emp.firstName} checked in at ${timeStr}`);

  res.json({ success: true, record });
});

apiRouter.post('/attendance/check-out', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId } = req.body;

  const attendance = db.get('attendance');
  const today = '2026-11-10';
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const index = attendance.findIndex(a => a.tenantId === tenantId && a.employeeId === employeeId && a.date === today);
  if (index === -1 || !attendance[index].checkIn) {
    return res.status(400).json({ error: 'No check-in record found for today to punch out.' });
  }

  const rec = attendance[index];
  const [inH, inM] = rec.checkIn!.split(':').map(Number);
  const diffHours = Math.max(0.5, Math.round(((now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM)) / 60 * 10) / 10);
  const overtime = diffHours > 9 ? Math.round((diffHours - 9) * 60) : 0;

  rec.checkOut = timeStr;
  rec.totalHours = diffHours;
  rec.overtimeMinutes = overtime;

  attendance[index] = rec;
  db.set('attendance', attendance);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'ATTENDANCE_CHECKOUT', 'Attendance', rec.id, `Checked out at ${timeStr}. Total hours: ${diffHours}`);
  res.json({ success: true, record: rec });
});

apiRouter.get('/attendance/shifts', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json(db.get('shifts').filter(s => s.tenantId === tenantId));
});

// ==========================================
// 6. LEAVE MANAGEMENT & HOLIDAYS
// ==========================================

apiRouter.get('/leaves/overview', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId } = req.query;

  const types = db.get('leaveTypes').filter(t => t.tenantId === tenantId);
  let balances = db.get('leaveBalances').filter(b => b.tenantId === tenantId);
  let requests = db.get('leaveRequests').filter(r => r.tenantId === tenantId);
  const holidays = db.get('holidays').filter(h => h.tenantId === tenantId);

  if (employeeId) {
    balances = balances.filter(b => b.employeeId === employeeId);
    requests = requests.filter(r => r.employeeId === employeeId);
  }

  res.json({
    types,
    balances,
    requests,
    holidays
  });
});

apiRouter.post('/leaves/apply', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason } = req.body;

  if (!employeeId || !leaveTypeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Employee, Leave Type, and dates are required.' });
  }

  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const emp = employees.find(e => e.id === employeeId);
  const leaveTypes = db.get('leaveTypes').filter(t => t.tenantId === tenantId);
  const lt = leaveTypes.find(t => t.id === leaveTypeId);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
  const totalDays = isHalfDay ? 0.5 : diffDays;

  // Check balance
  const balances = db.get('leaveBalances');
  const balIdx = balances.findIndex(b => b.tenantId === tenantId && b.employeeId === employeeId && b.leaveTypeId === leaveTypeId);

  if (balIdx !== -1 && !lt?.isUnpaid && balances[balIdx].available < totalDays) {
    return res.status(400).json({ error: `Insufficient leave balance. Available: ${balances[balIdx].available} days, Requested: ${totalDays} days.` });
  }

  const newRequest: LeaveRequest = {
    id: `lr-${Date.now()}`,
    tenantId,
    employeeId,
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
    leaveTypeId,
    leaveTypeName: lt?.name || 'Leave',
    startDate,
    endDate,
    isHalfDay: Boolean(isHalfDay),
    halfDayType,
    totalDays,
    reason: reason || 'Personal Leave',
    status: 'PENDING',
    appliedAt: new Date().toISOString()
  };

  const requests = db.get('leaveRequests');
  requests.unshift(newRequest);
  db.set('leaveRequests', requests);

  // Update pending balance
  if (balIdx !== -1) {
    balances[balIdx].pending += totalDays;
    db.set('leaveBalances', balances);
  }

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'LEAVE_APPLIED', 'LeaveRequest', newRequest.id, `${newRequest.employeeName} applied for ${totalDays} days ${lt?.name}`);
  res.status(201).json(newRequest);
});

apiRouter.post('/leaves/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;

  const requests = db.get('leaveRequests');
  const index = requests.findIndex(r => r.id === id && r.tenantId === tenantId);
  if (index === -1) return res.status(404).json({ error: 'Leave request not found' });

  const reqObj = requests[index];
  if (reqObj.status !== 'PENDING') {
    return res.status(400).json({ error: `Cannot approve request with status ${reqObj.status}` });
  }

  reqObj.status = 'APPROVED';
  reqObj.approvedBy = req.currentUser?.id;
  reqObj.approverName = req.currentUser?.name;
  reqObj.reviewedAt = new Date().toISOString();
  requests[index] = reqObj;
  db.set('leaveRequests', requests);

  // Deduct from balance
  const balances = db.get('leaveBalances');
  const balIdx = balances.findIndex(b => b.tenantId === tenantId && b.employeeId === reqObj.employeeId && b.leaveTypeId === reqObj.leaveTypeId);
  if (balIdx !== -1) {
    balances[balIdx].pending = Math.max(0, balances[balIdx].pending - reqObj.totalDays);
    balances[balIdx].used += reqObj.totalDays;
    balances[balIdx].available = Math.max(0, balances[balIdx].allocated - balances[balIdx].used);
    db.set('leaveBalances', balances);
  }

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'LEAVE_APPROVED', 'LeaveRequest', id, `Approved ${reqObj.totalDays} days leave for ${reqObj.employeeName}`);
  res.json({ success: true, request: reqObj });
});

apiRouter.post('/leaves/:id/reject', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;
  const { reason } = req.body;

  const requests = db.get('leaveRequests');
  const index = requests.findIndex(r => r.id === id && r.tenantId === tenantId);
  if (index === -1) return res.status(404).json({ error: 'Leave request not found' });

  const reqObj = requests[index];
  reqObj.status = 'REJECTED';
  reqObj.rejectionReason = reason || 'Business operational requirements.';
  reqObj.reviewedAt = new Date().toISOString();
  requests[index] = reqObj;
  db.set('leaveRequests', requests);

  // Restore pending balance
  const balances = db.get('leaveBalances');
  const balIdx = balances.findIndex(b => b.tenantId === tenantId && b.employeeId === reqObj.employeeId && b.leaveTypeId === reqObj.leaveTypeId);
  if (balIdx !== -1) {
    balances[balIdx].pending = Math.max(0, balances[balIdx].pending - reqObj.totalDays);
    db.set('leaveBalances', balances);
  }

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'LEAVE_REJECTED', 'LeaveRequest', id, `Rejected leave for ${reqObj.employeeName}`);
  res.json({ success: true, request: reqObj });
});

// ==========================================
// 7. PAYROLL MANAGEMENT & PAYSLIPS
// ==========================================

apiRouter.get('/payroll/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const runs = db.get('payrollRuns').filter(p => p.tenantId === tenantId);
  const payslips = db.get('payslips').filter(ps => ps.tenantId === tenantId);
  const employees = db.get('employees').filter(e => e.tenantId === tenantId && e.status === 'ACTIVE');

  res.json({
    runs,
    payslips,
    activeEmployeeCount: employees.length,
    latestRun: runs[runs.length - 1] || null
  });
});

// Run Payroll Calculation Engine
apiRouter.post('/payroll/calculate', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { month, year } = req.body;

  const targetMonth = Number(month) || 11;
  const targetYear = Number(year) || 2026;

  const employees = db.get('employees').filter(e => e.tenantId === tenantId && e.status === 'ACTIVE');
  const payrollRuns = db.get('payrollRuns');
  const existingPayslips = db.get('payslips');

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  const runId = `pr-${targetYear}-${String(targetMonth).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
  const generatedPayslips: Payslip[] = [];

  employees.forEach(emp => {
    const sal = emp.salaryDetails || {
      basicMonthly: 5000,
      hraMonthly: 2500,
      specialAllowanceMonthly: 1500,
      conveyanceMonthly: 500,
      pfApplicable: true,
      esiApplicable: false,
      ptApplicable: true,
      taxRegime: 'NEW'
    };

    const workingDays = 22;
    const presentDays = 22;
    const paidLeaveDays = 0;
    const lopDays = 0;

    const basic = sal.basicMonthly;
    const hra = sal.hraMonthly;
    const special = sal.specialAllowanceMonthly;
    const conveyance = sal.conveyanceMonthly;
    const gross = basic + hra + special + conveyance;

    // Statutory rules calculations with precise rounded decimals
    const pf = sal.pfApplicable ? Math.round(basic * 0.12) : 0;
    const esi = sal.esiApplicable && gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const pt = sal.ptApplicable ? (gross > 15000 ? 50 : 0) : 0;
    const tds = Math.round(gross * 0.08); // standard tax projection withholding

    const deductions = pf + esi + pt + tds;
    const net = gross - deductions;

    totalGross += gross;
    totalDeductions += deductions;
    totalNet += net;

    const payslip: Payslip = {
      id: `ps-${emp.id}-${targetMonth}-${targetYear}`,
      tenantId,
      payrollRunId: runId,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeNumber: emp.employeeNumber,
      designation: emp.designationTitle || 'Professional',
      department: emp.departmentName || 'Operations',
      month: targetMonth,
      year: targetYear,
      workingDays,
      presentDays,
      paidLeaveDays,
      lopDays,
      basic,
      hra,
      specialAllowance: special,
      conveyance,
      grossSalary: gross,
      pfDeduction: pf,
      esiDeduction: esi,
      ptDeduction: pt,
      tdsDeduction: tds,
      totalDeductions: deductions,
      netSalary: net,
      paymentStatus: 'PENDING',
      generatedAt: new Date().toISOString()
    };

    generatedPayslips.push(payslip);
  });

  const newRun: PayrollRun = {
    id: runId,
    tenantId,
    month: targetMonth,
    year: targetYear,
    status: 'CALCULATED',
    employeeCount: employees.length,
    totalGross,
    totalDeductions,
    totalNet,
    processedAt: new Date().toISOString()
  };

  payrollRuns.unshift(newRun);
  db.set('payrollRuns', payrollRuns);

  // Add generated payslips
  const filteredExisting = existingPayslips.filter(p => !(p.tenantId === tenantId && p.month === targetMonth && p.year === targetYear));
  db.set('payslips', [...generatedPayslips, ...filteredExisting]);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'PAYROLL_CALCULATED', 'PayrollRun', runId, `Calculated payroll for ${targetMonth}/${targetYear} across ${employees.length} employees. Total Net: ₹${totalNet.toLocaleString('en-IN')}`);

  res.status(201).json({
    success: true,
    run: newRun,
    payslips: generatedPayslips
  });
});

apiRouter.post('/payroll/runs/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;

  const runs = db.get('payrollRuns');
  const idx = runs.findIndex(r => r.id === id && r.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Payroll run not found' });

  runs[idx].status = 'APPROVED';
  runs[idx].approvedBy = req.currentUser?.name;
  runs[idx].lockedAt = new Date().toISOString();
  db.set('payrollRuns', runs);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'PAYROLL_APPROVED', 'PayrollRun', id, `Approved payroll cycle ${runs[idx].month}/${runs[idx].year}`);
  res.json({ success: true, run: runs[idx] });
});

apiRouter.post('/payroll/runs/:id/publish', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;

  const runs = db.get('payrollRuns');
  const idx = runs.findIndex(r => r.id === id && r.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Payroll run not found' });

  runs[idx].status = 'PUBLISHED';
  runs[idx].publishedAt = new Date().toISOString();
  db.set('payrollRuns', runs);

  // Update payslips to PAID
  const payslips = db.get('payslips');
  payslips.forEach(ps => {
    if (ps.payrollRunId === id) {
      ps.paymentStatus = 'PAID';
    }
  });
  db.set('payslips', payslips);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'PAYROLL_PUBLISHED', 'PayrollRun', id, `Published payroll and distributed payslips for ${runs[idx].month}/${runs[idx].year}`);
  res.json({ success: true, run: runs[idx] });
});

// ==========================================
// 8. RECRUITMENT & ATS
// ==========================================

apiRouter.get('/recruitment/overview', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json({
    jobs: db.get('jobOpenings').filter(j => j.tenantId === tenantId),
    candidates: db.get('candidates').filter(c => c.tenantId === tenantId)
  });
});

apiRouter.post('/recruitment/jobs', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { title, departmentId, openings, experienceLevel, employmentType, salaryRange, description } = req.body;

  const departments = db.get('departments').filter(d => d.tenantId === tenantId);
  const branches = db.get('branches').filter(b => b.tenantId === tenantId);
  const dept = departments.find(d => d.id === departmentId);

  const jobs = db.get('jobOpenings');
  const newJob: JobOpening = {
    id: `job-${Date.now()}`,
    tenantId,
    title,
    departmentId: departmentId || departments[0]?.id || '',
    departmentName: dept?.name || 'General',
    branchId: branches[0]?.id || '',
    openings: Number(openings) || 1,
    experienceLevel: experienceLevel || '3+ Years',
    employmentType: employmentType || 'Full-time',
    salaryRange: salaryRange || 'Competitive',
    description: description || 'Exciting career opportunity at Natton Technology.',
    status: 'ACTIVE',
    applicantsCount: 0,
    createdAt: new Date().toISOString()
  };

  jobs.unshift(newJob);
  db.set('jobOpenings', jobs);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'JOB_OPENING_CREATED', 'JobOpening', newJob.id, `Created job opening: ${title}`);
  res.status(201).json(newJob);
});

apiRouter.patch('/recruitment/candidates/:id/stage', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;
  const { stage, notes } = req.body;

  const candidates = db.get('candidates');
  const idx = candidates.findIndex(c => c.id === id && c.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Candidate not found' });

  candidates[idx].stage = stage;
  if (notes) candidates[idx].notes = notes;
  db.set('candidates', candidates);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'CANDIDATE_STAGE_MOVED', 'Candidate', id, `Moved candidate ${candidates[idx].name} to ${stage}`);
  res.json({ success: true, candidate: candidates[idx] });
});

// ==========================================
// 9. ONBOARDING & OFFBOARDING
// ==========================================

apiRouter.get('/onboarding/tasks', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json(db.get('onboardingTasks').filter(t => t.tenantId === tenantId));
});

apiRouter.patch('/onboarding/tasks/:id', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;
  const { status } = req.body;

  const tasks = db.get('onboardingTasks');
  const idx = tasks.findIndex(t => t.id === id && t.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  tasks[idx].status = status;
  if (status === 'COMPLETED') tasks[idx].completedAt = new Date().toISOString();
  db.set('onboardingTasks', tasks);

  res.json(tasks[idx]);
});

apiRouter.get('/offboarding/resignations', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json(db.get('resignations').filter(r => r.tenantId === tenantId));
});

apiRouter.post('/offboarding/resignations', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId, desiredLastDate, reason } = req.body;

  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const resignations = db.get('resignations');
  const newRes: Resignation = {
    id: `res-${Date.now()}`,
    tenantId,
    employeeId: emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    employeeNumber: emp.employeeNumber,
    department: emp.departmentName || 'General',
    submissionDate: new Date().toISOString().split('T')[0],
    desiredLastDate,
    reason: reason || 'Personal aspirations',
    status: 'SUBMITTED',
    clearances: {
      department: false,
      itAssets: false,
      finance: false,
      hr: false
    }
  };

  resignations.unshift(newRes);
  db.set('resignations', resignations);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'RESIGNATION_SUBMITTED', 'Resignation', newRes.id, `Resignation submitted by ${newRes.employeeName}`);
  res.status(201).json(newRes);
});

apiRouter.patch('/offboarding/resignations/:id/clearance', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { id } = req.params;
  const { clearanceType, value } = req.body;

  const resignations = db.get('resignations');
  const idx = resignations.findIndex(r => r.id === id && r.tenantId === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Resignation record not found' });

  if (clearanceType in resignations[idx].clearances) {
    (resignations[idx].clearances as any)[clearanceType] = Boolean(value);
  }

  // Check if all clearances complete
  const c = resignations[idx].clearances;
  if (c.department && c.itAssets && c.finance && c.hr) {
    resignations[idx].status = 'COMPLETED';
  }

  db.set('resignations', resignations);
  res.json(resignations[idx]);
});

// ==========================================
// 10. ADVANCED MODULES: GOALS, EXPENSES, ASSETS, TICKETS, ANNOUNCEMENTS
// ==========================================

apiRouter.get('/modules/all', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  res.json({
    performanceGoals: db.get('performanceGoals').filter(g => g.tenantId === tenantId),
    expenses: db.get('expenses').filter(e => e.tenantId === tenantId),
    assets: db.get('assets').filter(a => a.tenantId === tenantId),
    tickets: db.get('tickets').filter(t => t.tenantId === tenantId),
    announcements: db.get('announcements').filter(a => a.tenantId === tenantId),
    auditLogs: db.get('auditLogs').filter(l => l.tenantId === tenantId).slice(0, 50)
  });
});

apiRouter.post('/expenses/submit', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId, category, amount, currency, merchant, expenseDate, receiptName } = req.body;

  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const emp = employees.find(e => e.id === employeeId);

  const expenses = db.get('expenses');
  const newExp: ExpenseClaim = {
    id: `exp-${Date.now()}`,
    tenantId,
    employeeId: employeeId || employees[0]?.id || '',
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
    category: category || 'TRAVEL',
    amount: Number(amount) || 0,
    currency: currency || req.currentTenant?.currency || 'USD',
    merchant: merchant || 'Vendor',
    expenseDate: expenseDate || new Date().toISOString().split('T')[0],
    receiptName: receiptName || 'receipt.pdf',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString()
  };

  expenses.unshift(newExp);
  db.set('expenses', expenses);

  db.logAudit(tenantId, req.currentUser!.id, req.currentUser!.name, 'EXPENSE_SUBMITTED', 'ExpenseClaim', newExp.id, `Submitted expense: ${newExp.amount} ${newExp.currency} by ${newExp.employeeName}`);
  res.status(201).json(newExp);
});

apiRouter.post('/helpdesk/tickets', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { employeeId, category, priority, subject, description } = req.body;

  const employees = db.get('employees').filter(e => e.tenantId === tenantId);
  const emp = employees.find(e => e.id === employeeId);

  const tickets = db.get('tickets');
  const newTicket: HelpdeskTicket = {
    id: `tkt-${Date.now()}`,
    tenantId,
    ticketNumber: `TKT-2026-${Math.floor(Math.random() * 899 + 100)}`,
    employeeId: employeeId || employees[0]?.id || '',
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
    category: category || 'GENERAL',
    priority: priority || 'MEDIUM',
    subject,
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    responses: []
  };

  tickets.unshift(newTicket);
  db.set('tickets', tickets);

  res.status(201).json(newTicket);
});

// ==========================================
// 11. SAAS GLOBAL SUPER ADMIN
// ==========================================

apiRouter.get('/superadmin/overview', (req: AuthenticatedRequest, res: Response) => {
  const tenants = db.get('tenants');
  const invoices = db.get('invoices');
  const employees = db.get('employees');

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
  const trialTenants = tenants.filter(t => t.status === 'TRIAL');

  // MRR estimation
  const planPrices: Record<string, number> = {
    STARTER: 99,
    GROWTH: 249,
    BUSINESS: 499,
    ENTERPRISE: 1299
  };

  const mrr = tenants.reduce((sum, t) => sum + (planPrices[t.planId] || 99), 0);
  const arr = mrr * 12;

  res.json({
    totalTenants: tenants.length,
    activeTenantsCount: activeTenants.length,
    trialTenantsCount: trialTenants.length,
    totalEmployeesAcrossPlatform: employees.length,
    mrr,
    arr,
    tenants,
    invoices,
    systemHealth: {
      status: 'HEALTHY',
      uptime: '99.98%',
      dbLatencyMs: 14,
      backgroundWorkers: 'ONLINE',
      auditEngine: 'ACTIVE'
    }
  });
});

apiRouter.patch('/superadmin/tenants/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, planId } = req.body;

  const tenants = db.get('tenants');
  const idx = tenants.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tenant not found' });

  if (status) tenants[idx].status = status;
  if (planId) tenants[idx].planId = planId;
  db.set('tenants', tenants);

  res.json(tenants[idx]);
});

// ==========================================
// 12. EXPORT DATA (CSV)
// ==========================================

apiRouter.get('/export/:type', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { type } = req.params;

  if (type === 'employees') {
    const list = db.get('employees').filter(e => e.tenantId === tenantId);
    let csv = 'Employee ID,First Name,Last Name,Email,Department,Designation,Branch,Status,Joining Date\n';
    list.forEach(e => {
      csv += `"${e.employeeNumber}","${e.firstName}","${e.lastName}","${e.email}","${e.departmentName || ''}","${e.designationTitle || ''}","${e.branchName || ''}","${e.status}","${e.joiningDate}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_${tenantId}.csv`);
    return res.send(csv);
  }

  if (type === 'attendance') {
    const list = db.get('attendance').filter(a => a.tenantId === tenantId);
    let csv = 'Date,Employee ID,Name,Check In,Check Out,Total Hours,Status,Late (Mins),Location\n';
    list.forEach(a => {
      csv += `"${a.date}","${a.employeeNumber || ''}","${a.employeeName || ''}","${a.checkIn || '-'}","${a.checkOut || '-'}","${a.totalHours}","${a.status}","${a.lateMinutes}","${a.location || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${tenantId}.csv`);
    return res.send(csv);
  }

  if (type === 'payroll') {
    const list = db.get('payslips').filter(p => p.tenantId === tenantId);
    let csv = 'Month,Year,Employee ID,Name,Department,Designation,Basic,HRA,Gross,PF,ESI,PT,TDS,Total Deductions,Net Salary\n';
    list.forEach(p => {
      csv += `"${p.month}","${p.year}","${p.employeeNumber}","${p.employeeName}","${p.department}","${p.designation}",${p.basic},${p.hra},${p.grossSalary},${p.pfDeduction},${p.esiDeduction},${p.ptDeduction},${p.tdsDeduction},${p.totalDeductions},${p.netSalary}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_register_${tenantId}.csv`);
    return res.send(csv);
  }

  res.status(400).json({ error: 'Unknown export type' });
});

// ==========================================
// 13. NOTIFICATIONS & BROADCASTS
// ==========================================

apiRouter.get('/notifications', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const currentUserId = req.currentUser?.id;

  const allNotifs = db.get('notifications') || [];
  const tenantNotifs = allNotifs.filter(n => {
    if (n.tenantId !== tenantId) return false;
    // Broadcast to all OR specific to this user
    return n.userId === 'ALL' || n.userId === currentUserId || !n.userId;
  });

  const unreadCount = tenantNotifs.filter(n => !n.read).length;

  res.json({
    notifications: tenantNotifs,
    unreadCount,
    total: tenantNotifs.length
  });
});

apiRouter.post('/notifications', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const { title, message, type = 'INFO', target = 'ALL', departmentId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const notifications = db.get('notifications') || [];
  const employees = db.get('employees').filter(e => e.tenantId === tenantId);

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tenantId,
    userId: target === 'ALL' ? 'ALL' : (req.body.userId || 'ALL'),
    title,
    message,
    type: type as any,
    read: false,
    createdAt: new Date().toISOString()
  };

  // Prepend so newest is first
  notifications.unshift(newNotif);
  db.set('notifications', notifications);

  // Audit log
  db.logAudit(
    tenantId,
    req.currentUser!.id,
    req.currentUser!.name,
    'NOTIFICATION_BROADCAST',
    'Notification',
    newNotif.id,
    `Broadcasted notification "${title}" to ${target === 'ALL' ? `all ${employees.length} employees` : 'selected recipients'}`
  );

  res.status(201).json({
    success: true,
    notification: newNotif,
    recipientsCount: target === 'ALL' ? employees.length : 1,
    message: `Notification broadcasted to ${target === 'ALL' ? `all ${employees.length} employees` : 'recipient'}`
  });
});

apiRouter.patch('/notifications/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const notifications = db.get('notifications') || [];
  const idx = notifications.findIndex(n => n.id === id);

  if (idx !== -1) {
    notifications[idx].read = true;
    db.set('notifications', notifications);
    return res.json({ success: true, notification: notifications[idx] });
  }

  res.status(404).json({ error: 'Notification not found' });
});

apiRouter.post('/notifications/mark-all-read', (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.currentTenant?.id!;
  const currentUserId = req.currentUser?.id;

  const notifications = db.get('notifications') || [];
  notifications.forEach(n => {
    if (n.tenantId === tenantId && (n.userId === 'ALL' || n.userId === currentUserId)) {
      n.read = true;
    }
  });

  db.set('notifications', notifications);
  res.json({ success: true, message: 'All notifications marked as read' });
});

apiRouter.delete('/notifications/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let notifications = db.get('notifications') || [];
  notifications = notifications.filter(n => n.id !== id);
  db.set('notifications', notifications);
  res.json({ success: true });
});

