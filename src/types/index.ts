export type UserRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_SUPPORT'
  | 'COMPANY_ADMIN'
  | 'HR_ADMIN'
  | 'HR_EXECUTIVE'
  | 'PAYROLL_ADMIN'
  | 'FINANCE_MANAGER'
  | 'DEPARTMENT_MANAGER'
  | 'TEAM_LEAD'
  | 'EMPLOYEE'
  | 'RECRUITER'
  | 'AUDITOR';

export type TenantPlan = 'STARTER' | 'GROWTH' | 'BUSINESS' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  planId: TenantPlan;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED';
  logoUrl?: string;
  brandColor?: string;
  currency: string;
  timezone: string;
  country: string;
  employeeCount: number;
  maxEmployees: number;
  createdAt: string;
  trialEndsAt?: string;
  whiteLabel?: {
    enabled: boolean;
    brandName?: string;
    subdomain?: string;
    customLogo?: string;
    primaryColor?: string;
  };
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  employeeId?: string;
  role: UserRole;
  permissions: string[];
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  isHeadquarters: boolean;
  geofence?: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
}

export interface Department {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  code: string;
  managerId?: string;
  budget?: number;
}

export interface Designation {
  id: string;
  tenantId: string;
  departmentId: string;
  title: string;
  level: string;
  minSalary: number;
  maxSalary: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  userId?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  departmentId: string;
  departmentName?: string;
  designationId: string;
  designationTitle?: string;
  branchId: string;
  branchName?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  workMode: 'OFFICE' | 'REMOTE' | 'HYBRID';
  joiningDate: string;
  confirmationDate?: string;
  status: 'ACTIVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'OFFBOARDED' | 'ARCHIVED';
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    holderName: string;
  };
  salaryDetails?: {
    ctcAnnual: number;
    basicMonthly: number;
    hraMonthly: number;
    specialAllowanceMonthly: number;
    conveyanceMonthly: number;
    pfApplicable: boolean;
    esiApplicable: boolean;
    ptApplicable: boolean;
    taxRegime: 'NEW' | 'OLD';
  };
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workMode: 'OFFICE' | 'REMOTE' | 'HYBRID';
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE';
  lateMinutes: number;
  overtimeMinutes: number;
  totalHours: number;
  location?: string;
  isRegularized?: boolean;
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  graceMinutes: number;
  halfDayHours: number;
  isOvernight: boolean;
  color: string;
}

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  daysPerYear: number;
  carryForwardMax: number;
  isUnpaid: boolean;
  color: string;
}

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  color: string;
  allocated: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approverName?: string;
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface Holiday {
  id: string;
  tenantId: string;
  name: string;
  date: string;
  type: 'NATIONAL' | 'STATE' | 'COMPANY' | 'OPTIONAL';
  description?: string;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  month: number; // 1-12
  year: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'LOCKED' | 'PUBLISHED';
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedAt?: string;
  approvedBy?: string;
  lockedAt?: string;
  publishedAt?: string;
}

export interface Payslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  designation: string;
  department: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PROCESSED' | 'PAID';
  generatedAt: string;
}

export interface JobOpening {
  id: string;
  tenantId: string;
  title: string;
  departmentId: string;
  departmentName?: string;
  branchId: string;
  openings: number;
  experienceLevel: string;
  employmentType: string;
  salaryRange: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED';
  applicantsCount: number;
  createdAt: string;
}

export interface Candidate {
  id: string;
  tenantId: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  currentCompany?: string;
  stage: 'APPLIED' | 'SCREENING' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'HIRED' | 'REJECTED';
  rating: number; // 1-5
  notes?: string;
  appliedAt: string;
}

export interface OnboardingTask {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: 'DOCUMENTATION' | 'IT_HARDWARE' | 'HR_POLICY' | 'ORIENTATION';
  assignedToRole: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  completedAt?: string;
}

export interface PerformanceGoal {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  category: 'OKR' | 'KPI' | 'DEVELOPMENT';
  targetMetric: string;
  progressPercent: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK';
  weightage: number;
}

export interface ExpenseClaim {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  category: 'TRAVEL' | 'MEALS' | 'INTERNET' | 'SOFTWARE' | 'OFFICE_SUPPLIES';
  amount: number;
  currency: string;
  merchant: string;
  expenseDate: string;
  receiptName?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  rejectionReason?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  assetCode: string;
  name: string;
  category: 'LAPTOP' | 'MONITOR' | 'PHONE' | 'ACCESSORY' | 'VEHICLE';
  serialNumber: string;
  purchaseDate: string;
  cost: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
  assignedToEmployeeId?: string;
  assignedToEmployeeName?: string;
  assignedDate?: string;
}

export interface HelpdeskTicket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  employeeId: string;
  employeeName?: string;
  category: 'PAYROLL' | 'ATTENDANCE' | 'LEAVE' | 'IT_SUPPORT' | 'BENEFITS' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
  responses: Array<{
    id: string;
    authorName: string;
    isStaff: boolean;
    message: string;
    createdAt: string;
  }>;
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  authorName: string;
  category: 'COMPANY_NEWS' | 'POLICY' | 'EVENT' | 'URGENT';
  pinned: boolean;
  createdAt: string;
}

export interface Resignation {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  submissionDate: string;
  desiredLastDate: string;
  approvedLastDate?: string;
  reason: string;
  status: 'SUBMITTED' | 'MANAGER_REVIEW' | 'HR_REVIEW' | 'CLEARANCE' | 'COMPLETED' | 'REJECTED';
  clearances: {
    department: boolean;
    itAssets: boolean;
    finance: boolean;
    hr: boolean;
  };
  settlementAmount?: number;
}

export interface SubscriptionInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  planId: TenantPlan;
  amount: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'VOID';
  issuedAt: string;
  paidAt?: string;
  dueDate: string;
}

export interface AppNotification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
