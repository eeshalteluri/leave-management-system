// ── User & Auth ────────────────────────────────────────────────
export type UserRole = "employee" | "manager";
export type Department = "engineering" | "marketing" | "sales" | "hr";

export interface LeaveBalance {
  annual: number;
  sick: number;
  casual: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  leaveBalance?: LeaveBalance;
}

// Maximum allowed days per leave type (matches User model defaults)
export const LEAVE_BALANCE_MAX: LeaveBalance = {
  annual: 20,
  sick:   10,
  casual: 7,
};

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Leave ───────────────────────────────────────────────────────
// Your backend uses capitalized status strings
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type LeaveType =
  | "Sick Leave"
  | "Annual Leave"
  | "Casual Leave"
  | "Maternity Leave"
  | "Paternity Leave"
  | "Unpaid Leave";

export interface LeaveRequest {
  _id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  managerComment?: string;  // comment left by manager on review
  // employee field is present when viewed by employer
  employee?: User | { name: string; email: string; department?: string };
  createdAt: string;
  updatedAt: string;
}

// POST /api/leaves/apply
export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

// PUT /api/leaves/:id
export interface UpdateLeaveStatusPayload {
  status: "Approved" | "Rejected";
  managerComment?: string;
}

// ── Misc ────────────────────────────────────────────────────────
export interface LeaveTypeOption {
  value: LeaveType;
  label: string;
}

export type FilterOption = {
  value: LeaveStatus | "all";
  label: string;
};

// Response types
export interface MyLeavesResponse {
  message: string;
  leaves: LeaveRequest[];
}

export interface AllLeavesResponse {
  message: string;
  leaves: LeaveRequest[];
}