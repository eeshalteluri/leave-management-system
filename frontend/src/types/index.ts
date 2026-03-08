// ── User & Auth ────────────────────────────────────────────────
export type UserRole = "employee" | "employer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

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
  department?: string;
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

// PUT /api/leaves/:id  — your backend accepts capitalized status
export interface UpdateLeaveStatusPayload {
  status: "Approved" | "Rejected";
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
