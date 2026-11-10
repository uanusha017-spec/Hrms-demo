import fs from 'fs';
import path from 'path';
import {
  Tenant,
  User,
  TenantMembership,
  Branch,
  Department,
  Designation,
  Employee,
  AttendanceRecord,
  Shift,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
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
  SubscriptionInvoice,
  AppNotification
} from '../src/types/index.ts';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  tenants: Tenant[];
  users: User[];
  memberships: TenantMembership[];
  branches: Branch[];
  departments: Department[];
  designations: Designation[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  shifts: Shift[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  jobOpenings: JobOpening[];
  candidates: Candidate[];
  onboardingTasks: OnboardingTask[];
  performanceGoals: PerformanceGoal[];
  expenses: ExpenseClaim[];
  assets: Asset[];
  tickets: HelpdeskTicket[];
  announcements: Announcement[];
  resignations: Resignation[];
  invoices: SubscriptionInvoice[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'hrms.db.json');

function generateInitialSeed(): DatabaseSchema {
  const tApex: Tenant = {
    id: 'tenant-apex',
    name: 'Natton Technology',
    slug: 'natton-technology',
    planId: 'BUSINESS',
    status: 'ACTIVE',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    country: 'India',
    employeeCount: 42,
    maxEmployees: 100,
    createdAt: '2026-01-15T00:00:00.000Z',
    brandColor: '#2563EB',
    whiteLabel: {
      enabled: true,
      brandName: 'Natton Technology HR Portal',
      primaryColor: '#2563EB'
    }
  };

  const tNexus: Tenant = {
    id: 'tenant-nexus',
    name: 'Nexus Retail Ltd',
    slug: 'nexus-retail',
    planId: 'GROWTH',
    status: 'ACTIVE',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    country: 'India',
    employeeCount: 28,
    maxEmployees: 50,
    createdAt: '2026-02-01T00:00:00.000Z',
    brandColor: '#059669'
  };

  const tVertex: Tenant = {
    id: 'tenant-vertex',
    name: 'Vertex Digital Agency',
    slug: 'vertex-digital',
    planId: 'STARTER',
    status: 'TRIAL',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    country: 'India',
    employeeCount: 14,
    maxEmployees: 20,
    createdAt: '2026-03-01T00:00:00.000Z',
    trialEndsAt: '2026-03-31T00:00:00.000Z'
  };

  const users: User[] = [
    {
      id: 'usr-superadmin',
      email: 'admin@zenithhrms.io',
      name: 'Alexander Wright',
      isSuperAdmin: true
    },
    {
      id: 'usr-apex-admin',
      email: 'ceo@apextech.com',
      name: 'Victoria Vance',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-hr',
      email: 'hr@apextech.com',
      name: 'Elena Rostova',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-payroll',
      email: 'payroll@apextech.com',
      name: 'Devin Kothari',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-manager',
      email: 'engineering.head@apextech.com',
      name: 'David Sterling',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-emp1',
      email: 'sarah.chen@apextech.com',
      name: 'Sarah Chen',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-emp2',
      email: 'marcus.vance@apextech.com',
      name: 'Marcus Vance',
      isSuperAdmin: false
    },
    {
      id: 'usr-apex-emp3',
      email: 'priya.sharma@apextech.com',
      name: 'Priya Sharma',
      isSuperAdmin: false
    }
  ];

  const memberships: TenantMembership[] = [
    {
      id: 'mem-1',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-admin',
      role: 'COMPANY_ADMIN',
      permissions: ['*'],
      status: 'ACTIVE',
      joinedAt: '2026-01-15T00:00:00Z'
    },
    {
      id: 'mem-2',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-hr',
      employeeId: 'emp-apex-02',
      role: 'HR_ADMIN',
      permissions: ['employee.*', 'attendance.*', 'leave.*', 'recruitment.*', 'onboarding.*'],
      status: 'ACTIVE',
      joinedAt: '2026-01-16T00:00:00Z'
    },
    {
      id: 'mem-3',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-payroll',
      employeeId: 'emp-apex-03',
      role: 'PAYROLL_ADMIN',
      permissions: ['payroll.*', 'reports.payroll'],
      status: 'ACTIVE',
      joinedAt: '2026-01-18T00:00:00Z'
    },
    {
      id: 'mem-4',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-manager',
      employeeId: 'emp-apex-04',
      role: 'DEPARTMENT_MANAGER',
      permissions: ['team.attendance', 'team.leave', 'team.performance', 'team.approvals'],
      status: 'ACTIVE',
      joinedAt: '2026-01-20T00:00:00Z'
    },
    {
      id: 'mem-5',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp1',
      employeeId: 'emp-apex-01',
      role: 'EMPLOYEE',
      permissions: ['self.*'],
      status: 'ACTIVE',
      joinedAt: '2026-02-01T00:00:00Z'
    }
  ];

  const branches: Branch[] = [
    {
      id: 'br-apex-ny',
      tenantId: 'tenant-apex',
      name: 'New York Headquarters',
      code: 'NYC-HQ',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      isHeadquarters: true,
      geofence: { lat: 40.7128, lng: -74.006, radiusMeters: 500 }
    },
    {
      id: 'br-apex-sf',
      tenantId: 'tenant-apex',
      name: 'San Francisco Innovation Hub',
      code: 'SFO-01',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      isHeadquarters: false,
      geofence: { lat: 37.7749, lng: -122.4194, radiusMeters: 400 }
    },
    {
      id: 'br-apex-lon',
      tenantId: 'tenant-apex',
      name: 'London EMEA Center',
      code: 'LON-02',
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      isHeadquarters: false
    }
  ];

  const departments: Department[] = [
    { id: 'dept-eng', tenantId: 'tenant-apex', name: 'Software Engineering', code: 'ENG', managerId: 'emp-apex-04', budget: 1500000 },
    { id: 'dept-prod', tenantId: 'tenant-apex', name: 'Product & UX', code: 'PRD', managerId: 'emp-apex-04', budget: 600000 },
    { id: 'dept-sales', tenantId: 'tenant-apex', name: 'Global Sales & Enterprise', code: 'SLS', budget: 900000 },
    { id: 'dept-hr', tenantId: 'tenant-apex', name: 'People & Culture', code: 'HRD', managerId: 'emp-apex-02', budget: 400000 },
    { id: 'dept-fin', tenantId: 'tenant-apex', name: 'Finance & Compliance', code: 'FIN', managerId: 'emp-apex-03', budget: 350000 }
  ];

  const designations: Designation[] = [
    { id: 'des-se1', tenantId: 'tenant-apex', departmentId: 'dept-eng', title: 'Senior Full Stack Engineer', level: 'L5', minSalary: 110000, maxSalary: 160000 },
    { id: 'des-tl', tenantId: 'tenant-apex', departmentId: 'dept-eng', title: 'Engineering Director', level: 'L7', minSalary: 180000, maxSalary: 240000 },
    { id: 'des-pm', tenantId: 'tenant-apex', departmentId: 'dept-prod', title: 'Lead Product Designer', level: 'L5', minSalary: 95000, maxSalary: 140000 },
    { id: 'des-hrm', tenantId: 'tenant-apex', departmentId: 'dept-hr', title: 'Senior HR Business Partner', level: 'L4', minSalary: 85000, maxSalary: 120000 },
    { id: 'des-fin', tenantId: 'tenant-apex', departmentId: 'dept-fin', title: 'Senior Payroll Specialist', level: 'L4', minSalary: 80000, maxSalary: 115000 }
  ];

  const employees: Employee[] = [
    {
      id: 'emp-apex-01',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp1',
      employeeNumber: 'APX-1001',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@apextech.com',
      phone: '+1 (555) 234-5678',
      departmentId: 'dept-eng',
      departmentName: 'Software Engineering',
      designationId: 'des-se1',
      designationTitle: 'Senior Full Stack Engineer',
      branchId: 'br-apex-ny',
      branchName: 'New York Headquarters',
      reportingManagerId: 'emp-apex-04',
      reportingManagerName: 'David Sterling',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      joiningDate: '2024-03-15',
      status: 'ACTIVE',
      dob: '1992-06-14',
      gender: 'FEMALE',
      address: {
        street: '124 W 60th St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        pincode: '10023'
      },
      bankDetails: {
        bankName: 'JPMorgan Chase',
        accountNumber: '••••••••4829',
        routingNumber: '021000021',
        holderName: 'Sarah Chen'
      },
      salaryDetails: {
        ctcAnnual: 135000,
        basicMonthly: 5625,
        hraMonthly: 2812.5,
        specialAllowanceMonthly: 2250,
        conveyanceMonthly: 562.5,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    },
    {
      id: 'emp-apex-02',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-hr',
      employeeNumber: 'APX-1002',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'hr@apextech.com',
      phone: '+1 (555) 345-6789',
      departmentId: 'dept-hr',
      departmentName: 'People & Culture',
      designationId: 'des-hrm',
      designationTitle: 'Senior HR Business Partner',
      branchId: 'br-apex-ny',
      branchName: 'New York Headquarters',
      employmentType: 'FULL_TIME',
      workMode: 'OFFICE',
      joiningDate: '2023-01-10',
      status: 'ACTIVE',
      dob: '1989-11-20',
      gender: 'FEMALE',
      salaryDetails: {
        ctcAnnual: 110000,
        basicMonthly: 4583,
        hraMonthly: 2291,
        specialAllowanceMonthly: 1833,
        conveyanceMonthly: 458,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    },
    {
      id: 'emp-apex-03',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-payroll',
      employeeNumber: 'APX-1003',
      firstName: 'Devin',
      lastName: 'Kothari',
      email: 'payroll@apextech.com',
      phone: '+1 (555) 456-7890',
      departmentId: 'dept-fin',
      departmentName: 'Finance & Compliance',
      designationId: 'des-fin',
      designationTitle: 'Senior Payroll Specialist',
      branchId: 'br-apex-ny',
      branchName: 'New York Headquarters',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      joiningDate: '2023-05-15',
      status: 'ACTIVE',
      dob: '1990-04-12',
      gender: 'MALE',
      salaryDetails: {
        ctcAnnual: 98000,
        basicMonthly: 4083,
        hraMonthly: 2041,
        specialAllowanceMonthly: 1633,
        conveyanceMonthly: 408,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    },
    {
      id: 'emp-apex-04',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-manager',
      employeeNumber: 'APX-1004',
      firstName: 'David',
      lastName: 'Sterling',
      email: 'engineering.head@apextech.com',
      phone: '+1 (555) 567-8901',
      departmentId: 'dept-eng',
      departmentName: 'Software Engineering',
      designationId: 'des-tl',
      designationTitle: 'Engineering Director',
      branchId: 'br-apex-sf',
      branchName: 'San Francisco Innovation Hub',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      joiningDate: '2022-08-01',
      status: 'ACTIVE',
      dob: '1984-09-03',
      gender: 'MALE',
      salaryDetails: {
        ctcAnnual: 210000,
        basicMonthly: 8750,
        hraMonthly: 4375,
        specialAllowanceMonthly: 3500,
        conveyanceMonthly: 875,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    },
    {
      id: 'emp-apex-05',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp2',
      employeeNumber: 'APX-1005',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@apextech.com',
      phone: '+1 (555) 678-9012',
      departmentId: 'dept-prod',
      departmentName: 'Product & UX',
      designationId: 'des-pm',
      designationTitle: 'Lead Product Designer',
      branchId: 'br-apex-ny',
      branchName: 'New York Headquarters',
      reportingManagerId: 'emp-apex-04',
      reportingManagerName: 'David Sterling',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      joiningDate: '2024-01-10',
      status: 'ACTIVE',
      dob: '1993-02-18',
      gender: 'MALE',
      salaryDetails: {
        ctcAnnual: 125000,
        basicMonthly: 5208,
        hraMonthly: 2604,
        specialAllowanceMonthly: 2083,
        conveyanceMonthly: 520,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    },
    {
      id: 'emp-apex-06',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp3',
      employeeNumber: 'APX-1006',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@apextech.com',
      phone: '+1 (555) 789-0123',
      departmentId: 'dept-eng',
      departmentName: 'Software Engineering',
      designationId: 'des-se1',
      designationTitle: 'Senior Full Stack Engineer',
      branchId: 'br-apex-sf',
      branchName: 'San Francisco Innovation Hub',
      reportingManagerId: 'emp-apex-04',
      reportingManagerName: 'David Sterling',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      joiningDate: '2024-06-01',
      status: 'ACTIVE',
      dob: '1995-12-05',
      gender: 'FEMALE',
      salaryDetails: {
        ctcAnnual: 140000,
        basicMonthly: 5833,
        hraMonthly: 2916,
        specialAllowanceMonthly: 2333,
        conveyanceMonthly: 583,
        pfApplicable: true,
        esiApplicable: false,
        ptApplicable: true,
        taxRegime: 'NEW'
      }
    }
  ];

  const todayStr = '2026-11-10';

  const attendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-01',
      employeeName: 'Sarah Chen',
      employeeNumber: 'APX-1001',
      date: todayStr,
      checkIn: '08:58',
      checkOut: null,
      workMode: 'OFFICE',
      status: 'PRESENT',
      lateMinutes: 0,
      overtimeMinutes: 0,
      totalHours: 4.5,
      location: 'NYC-HQ (Office Wi-Fi / Biometric)'
    },
    {
      id: 'att-2',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-02',
      employeeName: 'Elena Rostova',
      employeeNumber: 'APX-1002',
      date: todayStr,
      checkIn: '08:45',
      checkOut: null,
      workMode: 'OFFICE',
      status: 'PRESENT',
      lateMinutes: 0,
      overtimeMinutes: 0,
      totalHours: 4.8,
      location: 'NYC-HQ'
    },
    {
      id: 'att-3',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-03',
      employeeName: 'Devin Kothari',
      employeeNumber: 'APX-1003',
      date: todayStr,
      checkIn: '09:18',
      checkOut: null,
      workMode: 'OFFICE',
      status: 'LATE',
      lateMinutes: 18,
      overtimeMinutes: 0,
      totalHours: 4.2,
      location: 'NYC-HQ'
    },
    {
      id: 'att-4',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-04',
      employeeName: 'David Sterling',
      employeeNumber: 'APX-1004',
      date: todayStr,
      checkIn: '08:30',
      checkOut: null,
      workMode: 'OFFICE',
      status: 'PRESENT',
      lateMinutes: 0,
      overtimeMinutes: 0,
      totalHours: 5.0,
      location: 'SFO-01'
    },
    {
      id: 'att-5',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-05',
      employeeName: 'Marcus Vance',
      employeeNumber: 'APX-1005',
      date: todayStr,
      checkIn: null,
      checkOut: null,
      workMode: 'OFFICE',
      status: 'ON_LEAVE',
      lateMinutes: 0,
      overtimeMinutes: 0,
      totalHours: 0,
      location: 'Approved Annual Leave'
    },
    {
      id: 'att-6',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-06',
      employeeName: 'Priya Sharma',
      employeeNumber: 'APX-1006',
      date: todayStr,
      checkIn: '09:00',
      checkOut: null,
      workMode: 'REMOTE',
      status: 'PRESENT',
      lateMinutes: 0,
      overtimeMinutes: 0,
      totalHours: 4.5,
      location: 'Remote IP: Verified VPN'
    }
  ];

  const shifts: Shift[] = [
    {
      id: 'sh-gen',
      tenantId: 'tenant-apex',
      name: 'General Day Shift',
      code: 'GS-0900',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      halfDayHours: 4.5,
      isOvernight: false,
      color: '#3B82F6'
    },
    {
      id: 'sh-morning',
      tenantId: 'tenant-apex',
      name: 'Early Morning Operations',
      code: 'EM-0700',
      startTime: '07:00',
      endTime: '15:30',
      graceMinutes: 10,
      halfDayHours: 4.0,
      isOvernight: false,
      color: '#10B981'
    },
    {
      id: 'sh-night',
      tenantId: 'tenant-apex',
      name: 'Global Support Shift (Rotational)',
      code: 'NS-2000',
      startTime: '20:00',
      endTime: '05:00',
      graceMinutes: 15,
      halfDayHours: 4.5,
      isOvernight: true,
      color: '#8B5CF6'
    }
  ];

  const leaveTypes: LeaveType[] = [
    { id: 'lt-cl', tenantId: 'tenant-apex', name: 'Casual Leave (CL)', code: 'CL', daysPerYear: 12, carryForwardMax: 3, isUnpaid: false, color: '#3B82F6' },
    { id: 'lt-sl', tenantId: 'tenant-apex', name: 'Sick / Medical Leave (SL)', code: 'SL', daysPerYear: 12, carryForwardMax: 0, isUnpaid: false, color: '#EF4444' },
    { id: 'lt-pl', tenantId: 'tenant-apex', name: 'Paid / Privilege Leave (PL)', code: 'PL', daysPerYear: 18, carryForwardMax: 10, isUnpaid: false, color: '#10B981' },
    { id: 'lt-ml', tenantId: 'tenant-apex', name: 'Parental / Maternity Leave', code: 'ML', daysPerYear: 84, carryForwardMax: 0, isUnpaid: false, color: '#EC4899' },
    { id: 'lt-lop', tenantId: 'tenant-apex', name: 'Leave Without Pay (LOP)', code: 'LOP', daysPerYear: 30, carryForwardMax: 0, isUnpaid: true, color: '#6B7280' }
  ];

  const leaveBalances: LeaveBalance[] = [
    { id: 'lb-1', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', leaveTypeId: 'lt-cl', leaveTypeName: 'Casual Leave', leaveTypeCode: 'CL', color: '#3B82F6', allocated: 12, used: 3, pending: 1, available: 8 },
    { id: 'lb-2', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', leaveTypeId: 'lt-sl', leaveTypeName: 'Sick Leave', leaveTypeCode: 'SL', color: '#EF4444', allocated: 12, used: 2, pending: 0, available: 10 },
    { id: 'lb-3', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', leaveTypeId: 'lt-pl', leaveTypeName: 'Privilege Leave', leaveTypeCode: 'PL', color: '#10B981', allocated: 18, used: 5, pending: 0, available: 13 },
    { id: 'lb-4', tenantId: 'tenant-apex', employeeId: 'emp-apex-05', leaveTypeId: 'lt-pl', leaveTypeName: 'Privilege Leave', leaveTypeCode: 'PL', color: '#10B981', allocated: 18, used: 8, pending: 0, available: 10 }
  ];

  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lr-1',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-01',
      employeeName: 'Sarah Chen',
      leaveTypeId: 'lt-cl',
      leaveTypeName: 'Casual Leave',
      startDate: '2026-11-24',
      endDate: '2026-11-25',
      isHalfDay: false,
      totalDays: 2,
      reason: 'Personal family commitment and travel.',
      status: 'PENDING',
      appliedAt: '2026-11-08T14:30:00Z'
    },
    {
      id: 'lr-2',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-05',
      employeeName: 'Marcus Vance',
      leaveTypeId: 'lt-pl',
      leaveTypeName: 'Privilege Leave',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      isHalfDay: false,
      totalDays: 3,
      reason: 'Annual pre-scheduled family vacation.',
      status: 'APPROVED',
      approvedBy: 'emp-apex-04',
      approverName: 'David Sterling',
      appliedAt: '2026-11-01T10:00:00Z',
      reviewedAt: '2026-11-02T09:15:00Z'
    },
    {
      id: 'lr-3',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-06',
      employeeName: 'Priya Sharma',
      leaveTypeId: 'lt-sl',
      leaveTypeName: 'Sick Leave',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      isHalfDay: false,
      totalDays: 2,
      reason: 'Viral fever & medical rest recommended by doctor.',
      status: 'APPROVED',
      approvedBy: 'emp-apex-04',
      approverName: 'David Sterling',
      appliedAt: '2026-10-15T08:00:00Z',
      reviewedAt: '2026-10-15T09:00:00Z'
    }
  ];

  const holidays: Holiday[] = [
    { id: 'hol-1', tenantId: 'tenant-apex', name: 'Thanksgiving Day', date: '2026-11-26', type: 'NATIONAL', description: 'Federal US Holiday' },
    { id: 'hol-2', tenantId: 'tenant-apex', name: 'Day After Thanksgiving', date: '2026-11-27', type: 'COMPANY', description: 'Company Paid Off' },
    { id: 'hol-3', tenantId: 'tenant-apex', name: 'Christmas Day', date: '2026-12-25', type: 'NATIONAL', description: 'Christmas Observance' },
    { id: 'hol-4', tenantId: 'tenant-apex', name: 'New Year Day', date: '2027-01-01', type: 'NATIONAL', description: 'Global New Year' }
  ];

  const payrollRuns: PayrollRun[] = [
    {
      id: 'pr-2026-10',
      tenantId: 'tenant-apex',
      month: 10,
      year: 2026,
      status: 'PUBLISHED',
      employeeCount: 6,
      totalGross: 68166,
      totalDeductions: 8450,
      totalNet: 59716,
      processedAt: '2026-10-28T18:00:00Z',
      approvedBy: 'usr-apex-admin',
      lockedAt: '2026-10-29T10:00:00Z',
      publishedAt: '2026-10-31T09:00:00Z'
    },
    {
      id: 'pr-2026-11',
      tenantId: 'tenant-apex',
      month: 11,
      year: 2026,
      status: 'CALCULATED',
      employeeCount: 6,
      totalGross: 68166,
      totalDeductions: 8450,
      totalNet: 59716,
      processedAt: '2026-11-09T17:00:00Z'
    }
  ];

  const payslips: Payslip[] = [
    {
      id: 'ps-1001-10',
      tenantId: 'tenant-apex',
      payrollRunId: 'pr-2026-10',
      employeeId: 'emp-apex-01',
      employeeName: 'Sarah Chen',
      employeeNumber: 'APX-1001',
      designation: 'Senior Full Stack Engineer',
      department: 'Software Engineering',
      month: 10,
      year: 2026,
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      basic: 5625,
      hra: 2812.5,
      specialAllowance: 2250,
      conveyance: 562.5,
      grossSalary: 11250,
      pfDeduction: 675,
      esiDeduction: 0,
      ptDeduction: 50,
      tdsDeduction: 750,
      totalDeductions: 1475,
      netSalary: 9775,
      paymentStatus: 'PAID',
      generatedAt: '2026-10-31T09:00:00Z'
    },
    {
      id: 'ps-1002-10',
      tenantId: 'tenant-apex',
      payrollRunId: 'pr-2026-10',
      employeeId: 'emp-apex-02',
      employeeName: 'Elena Rostova',
      employeeNumber: 'APX-1002',
      designation: 'Senior HR Business Partner',
      department: 'People & Culture',
      month: 10,
      year: 2026,
      workingDays: 22,
      presentDays: 21,
      paidLeaveDays: 1,
      lopDays: 0,
      basic: 4583,
      hra: 2291,
      specialAllowance: 1833,
      conveyance: 458,
      grossSalary: 9165,
      pfDeduction: 550,
      esiDeduction: 0,
      ptDeduction: 50,
      tdsDeduction: 580,
      totalDeductions: 1180,
      netSalary: 7985,
      paymentStatus: 'PAID',
      generatedAt: '2026-10-31T09:00:00Z'
    }
  ];

  const jobOpenings: JobOpening[] = [
    {
      id: 'job-1',
      tenantId: 'tenant-apex',
      title: 'Principal Distributed Systems Architect',
      departmentId: 'dept-eng',
      departmentName: 'Software Engineering',
      branchId: 'br-apex-ny',
      openings: 2,
      experienceLevel: '8+ Years',
      employmentType: 'Full-time',
      salaryRange: '₹18,00,000 - ₹24,00,000 / yr',
      description: 'Lead next-generation multi-tenant data architecture and microservices at global scale.',
      status: 'ACTIVE',
      applicantsCount: 14,
      createdAt: '2026-10-15T00:00:00Z'
    },
    {
      id: 'job-2',
      tenantId: 'tenant-apex',
      title: 'Product Designer (Design Systems)',
      departmentId: 'dept-prod',
      departmentName: 'Product & UX',
      branchId: 'br-apex-sf',
      openings: 1,
      experienceLevel: '4+ Years',
      employmentType: 'Full-time',
      salaryRange: '₹12,00,000 - ₹16,00,000 / yr',
      description: 'Shape our comprehensive enterprise SaaS UI system, component tokens, and mobile accessibility.',
      status: 'ACTIVE',
      applicantsCount: 22,
      createdAt: '2026-10-20T00:00:00Z'
    }
  ];

  const candidates: Candidate[] = [
    {
      id: 'cand-1',
      tenantId: 'tenant-apex',
      jobId: 'job-1',
      jobTitle: 'Principal Distributed Systems Architect',
      name: 'Robert Hayes',
      email: 'robert.hayes@example.com',
      phone: '+1 (555) 890-1234',
      experienceYears: 10,
      currentCompany: 'Datadog',
      stage: 'INTERVIEW',
      rating: 5,
      notes: 'Strong distributed transactions expertise; completed technical system design round with flying colors.',
      appliedAt: '2026-10-24T11:00:00Z'
    },
    {
      id: 'cand-2',
      tenantId: 'tenant-apex',
      jobId: 'job-1',
      jobTitle: 'Principal Distributed Systems Architect',
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      phone: '+1 (555) 901-2345',
      experienceYears: 9,
      currentCompany: 'Snowflake',
      stage: 'OFFER_SENT',
      rating: 5,
      notes: 'Offer package extended on Nov 5; waiting for signing by Nov 12.',
      appliedAt: '2026-10-18T09:30:00Z'
    },
    {
      id: 'cand-3',
      tenantId: 'tenant-apex',
      jobId: 'job-2',
      jobTitle: 'Product Designer (Design Systems)',
      name: 'Clara Oswald',
      email: 'clara.oswald@example.com',
      phone: '+1 (555) 012-3456',
      experienceYears: 5,
      currentCompany: 'Figma Community',
      stage: 'SHORTLISTED',
      rating: 4,
      notes: 'Impressive typography and enterprise portal portfolio.',
      appliedAt: '2026-11-02T16:20:00Z'
    }
  ];

  const onboardingTasks: OnboardingTask[] = [
    { id: 'ont-1', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', employeeName: 'Sarah Chen', title: 'Upload Government Photo ID & Tax Form W-4', category: 'DOCUMENTATION', assignedToRole: 'EMPLOYEE', status: 'COMPLETED', dueDate: '2024-03-20', completedAt: '2024-03-16' },
    { id: 'ont-2', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', employeeName: 'Sarah Chen', title: 'MacBook Pro M3 Max & YubiKey Provisioning', category: 'IT_HARDWARE', assignedToRole: 'IT_SUPPORT', status: 'COMPLETED', dueDate: '2024-03-15', completedAt: '2024-03-15' },
    { id: 'ont-3', tenantId: 'tenant-apex', employeeId: 'emp-apex-06', employeeName: 'Priya Sharma', title: 'Complete Security & Anti-Phishing Training', category: 'HR_POLICY', assignedToRole: 'EMPLOYEE', status: 'COMPLETED', dueDate: '2024-06-15', completedAt: '2024-06-12' }
  ];

  const performanceGoals: PerformanceGoal[] = [
    { id: 'pg-1', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', employeeName: 'Sarah Chen', title: 'Deliver Multi-tenant Database Isolation & RBAC', category: 'OKR', targetMetric: '100% test coverage & zero leaks', progressPercent: 88, status: 'IN_PROGRESS', weightage: 40 },
    { id: 'pg-2', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', employeeName: 'Sarah Chen', title: 'Latency Reduction on High-throughput Attendance API', category: 'KPI', targetMetric: 'P99 response time < 85ms', progressPercent: 95, status: 'IN_PROGRESS', weightage: 30 },
    { id: 'pg-3', tenantId: 'tenant-apex', employeeId: 'emp-apex-05', employeeName: 'Marcus Vance', title: 'Enterprise Design Token Specification (v2.0)', category: 'OKR', targetMetric: 'Zero design debt across 20 modules', progressPercent: 75, status: 'IN_PROGRESS', weightage: 50 }
  ];

  const expenses: ExpenseClaim[] = [
    { id: 'exp-1', tenantId: 'tenant-apex', employeeId: 'emp-apex-01', employeeName: 'Sarah Chen', category: 'TRAVEL', amount: 342.50, currency: 'USD', merchant: 'Amtrak Northeast Regional', expenseDate: '2026-10-22', receiptName: 'amtrak_receipt_oct22.pdf', status: 'PAID', createdAt: '2026-10-23T10:00:00Z' },
    { id: 'exp-2', tenantId: 'tenant-apex', employeeId: 'emp-apex-04', employeeName: 'David Sterling', category: 'MEALS', amount: 185.00, currency: 'USD', merchant: 'SF Tech Client Dinner', expenseDate: '2026-11-04', receiptName: 'dinner_receipt.pdf', status: 'APPROVED', createdAt: '2026-11-05T09:00:00Z' },
    { id: 'exp-3', tenantId: 'tenant-apex', employeeId: 'emp-apex-06', employeeName: 'Priya Sharma', category: 'INTERNET', amount: 80.00, currency: 'USD', merchant: 'Fiber Home Broadband', expenseDate: '2026-11-01', receiptName: 'nov_fiber_bill.pdf', status: 'SUBMITTED', createdAt: '2026-11-02T11:00:00Z' }
  ];

  const assets: Asset[] = [
    { id: 'ast-1', tenantId: 'tenant-apex', assetCode: 'AST-MBP-01', name: 'MacBook Pro 16" M3 Max 64GB', category: 'LAPTOP', serialNumber: 'C02G99AA1209', purchaseDate: '2024-03-01', cost: 3899, condition: 'EXCELLENT', assignedToEmployeeId: 'emp-apex-01', assignedToEmployeeName: 'Sarah Chen', assignedDate: '2024-03-15' },
    { id: 'ast-2', tenantId: 'tenant-apex', assetCode: 'AST-MON-02', name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor', category: 'MONITOR', serialNumber: 'CN-0K77X-998', purchaseDate: '2024-03-10', cost: 899, condition: 'EXCELLENT', assignedToEmployeeId: 'emp-apex-01', assignedToEmployeeName: 'Sarah Chen', assignedDate: '2024-03-15' },
    { id: 'ast-3', tenantId: 'tenant-apex', assetCode: 'AST-MBP-03', name: 'MacBook Pro 14" M3 Pro 36GB', category: 'LAPTOP', serialNumber: 'C02H11BB4391', purchaseDate: '2024-01-05', cost: 2499, condition: 'GOOD', assignedToEmployeeId: 'emp-apex-05', assignedToEmployeeName: 'Marcus Vance', assignedDate: '2024-01-10' }
  ];

  const tickets: HelpdeskTicket[] = [
    {
      id: 'tkt-101',
      tenantId: 'tenant-apex',
      ticketNumber: 'TKT-2026-089',
      employeeId: 'emp-apex-01',
      employeeName: 'Sarah Chen',
      category: 'BENEFITS',
      priority: 'MEDIUM',
      subject: 'Inquiry regarding 401(k) employer matching vesting schedule',
      description: 'Could you please confirm the exact date my Year 2 employer match tier becomes 100% vested?',
      status: 'RESOLVED',
      assignedTo: 'Elena Rostova',
      createdAt: '2026-10-29T11:20:00Z',
      responses: [
        { id: 'r1', authorName: 'Elena Rostova', isStaff: true, message: 'Hi Sarah, pursuant to our Plan Document, Year 2 matching vests upon completing 24 months of continuous service on March 15, 2026.', createdAt: '2026-10-30T10:00:00Z' }
      ]
    },
    {
      id: 'tkt-102',
      tenantId: 'tenant-apex',
      ticketNumber: 'TKT-2026-094',
      employeeId: 'emp-apex-06',
      employeeName: 'Priya Sharma',
      category: 'IT_SUPPORT',
      priority: 'HIGH',
      subject: 'VPN token reset request after mobile device update',
      description: 'Installed new iOS update and need Duo push MFA device re-enrollment code.',
      status: 'OPEN',
      assignedTo: 'IT Operations',
      createdAt: '2026-11-09T14:10:00Z',
      responses: []
    }
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      tenantId: 'tenant-apex',
      title: 'Annual Open Enrollment for 2027 Health & Wellness Benefits',
      content: 'The open enrollment portal is now active through November 30. Please review plan options including dental, vision, and HSA/FSA contributions.',
      authorName: 'Elena Rostova (Head of HR)',
      category: 'COMPANY_NEWS',
      pinned: true,
      createdAt: '2026-11-01T09:00:00Z'
    },
    {
      id: 'ann-2',
      tenantId: 'tenant-apex',
      title: 'Q4 Global Engineering All-Hands & Product Roadmap',
      content: 'Join us Thursday at 11:00 AM EST for our Q4 engineering showcase, celebrating our recent ISO/IEC 27001 audit completion and previewing our 2027 milestones.',
      authorName: 'Victoria Vance (CEO)',
      category: 'EVENT',
      pinned: false,
      createdAt: '2026-11-07T15:00:00Z'
    }
  ];

  const resignations: Resignation[] = [
    {
      id: 'res-1',
      tenantId: 'tenant-apex',
      employeeId: 'emp-apex-03',
      employeeName: 'Devin Kothari',
      employeeNumber: 'APX-1003',
      department: 'Finance & Compliance',
      submissionDate: '2026-10-15',
      desiredLastDate: '2026-11-30',
      approvedLastDate: '2026-11-30',
      reason: 'Relocating to Singapore for family reasons.',
      status: 'CLEARANCE',
      clearances: {
        department: true,
        itAssets: false,
        finance: true,
        hr: true
      },
      settlementAmount: 8450.00
    }
  ];

  const invoices: SubscriptionInvoice[] = [
    {
      id: 'inv-apex-01',
      tenantId: 'tenant-apex',
      tenantName: 'Natton Technology',
      invoiceNumber: 'INV-2026-0091',
      planId: 'BUSINESS',
      amount: 499.00,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      status: 'PAID',
      issuedAt: '2026-11-01T00:00:00Z',
      paidAt: '2026-11-01T04:12:00Z',
      dueDate: '2026-11-15T00:00:00Z'
    },
    {
      id: 'inv-nexus-01',
      tenantId: 'tenant-nexus',
      tenantName: 'Nexus Retail Ltd',
      invoiceNumber: 'INV-2026-0092',
      planId: 'GROWTH',
      amount: 249.00,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      status: 'PAID',
      issuedAt: '2026-11-01T00:00:00Z',
      paidAt: '2026-11-01T05:30:00Z',
      dueDate: '2026-11-15T00:00:00Z'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp1',
      title: 'October 2026 Payslip Available',
      message: 'Your payslip for October 2026 has been published and is ready for download.',
      type: 'SUCCESS',
      read: false,
      createdAt: '2026-10-31T09:00:00Z'
    },
    {
      id: 'notif-2',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-emp1',
      title: 'Leave Request Received',
      message: 'Your leave application for Nov 24-25 is pending manager review.',
      type: 'INFO',
      read: true,
      createdAt: '2026-11-08T14:31:00Z'
    },
    {
      id: 'notif-3',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-manager',
      title: 'Pending Leave Approval',
      message: 'Sarah Chen applied for 2 days Casual Leave (Nov 24 - Nov 25).',
      type: 'WARNING',
      read: false,
      createdAt: '2026-11-08T14:30:00Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-admin',
      userName: 'Victoria Vance',
      action: 'PAYROLL_PUBLISHED',
      entity: 'PayrollRun',
      entityId: 'pr-2026-10',
      details: 'Published October 2026 payroll for 6 employees. Net payout: ₹4,53,000.00',
      timestamp: '2026-10-31T09:00:00Z'
    },
    {
      id: 'aud-2',
      tenantId: 'tenant-apex',
      userId: 'usr-apex-manager',
      userName: 'David Sterling',
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRequest',
      entityId: 'lr-2',
      details: 'Approved 3 days Privilege Leave for Marcus Vance',
      timestamp: '2026-11-02T09:15:00Z'
    }
  ];

  return {
    tenants: [tApex, tNexus, tVertex],
    users,
    memberships,
    branches,
    departments,
    designations,
    employees,
    attendance,
    shifts,
    leaveTypes,
    leaveBalances,
    leaveRequests,
    holidays,
    payrollRuns,
    payslips,
    jobOpenings,
    candidates,
    onboardingTasks,
    performanceGoals,
    expenses,
    assets,
    tickets,
    announcements,
    resignations,
    invoices,
    notifications,
    auditLogs
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse database file, resetting to initial seed:', e);
        this.data = generateInitialSeed();
        this.save();
      }
    } else {
      this.data = generateInitialSeed();
      this.save();
    }
  }

  public save(): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]): void {
    this.data[key] = value;
    this.save();
  }

  public logAudit(tenantId: string, userId: string, userName: string, action: string, entity: string, entityId: string, details: string): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      userId,
      userName,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    // keep latest 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  public addNotification(tenantId: string, userId: string, title: string, message: string, type: AppNotification['type']): void {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
  }
}

export const db = new Database();
