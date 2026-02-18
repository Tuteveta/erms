// User Roles
export type UserRole = "SuperAdmin" | "HRManager" | "HROfficer";

// Employee Status
export type EmployeeStatus = "Active" | "Inactive";

// Allowed Actions for HR Officers
export type AllowedAction =
  | "CREATE_EMPLOYEE"
  | "EDIT_EMPLOYEE"
  | "DELETE_EMPLOYEE"
  | "VIEW_EMPLOYEE"
  | "UPLOAD_DOCUMENTS"
  | "VIEW_DOCUMENTS"
  | "GENERATE_REPORTS";

// Employee Record
export interface Employee {
  EmployeeID: string;
  FirstName: string;
  LastName: string;
  Department: string;
  Position: string;
  Email: string;
  Phone?: string;
  Status: EmployeeStatus;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy?: string;
}

// Employee Document
export interface EmployeeDocument {
  DocumentID: string;
  EmployeeID: string;
  FileName: string;
  FileKey: string;
  FileSize: number;
  UploadedAt: string;
  UploadedBy: string;
  Description?: string;
}

// Permission Set
export interface Permission {
  RoleID: string;
  RoleName: string;
  AllowedActions: AllowedAction[];
}

// HR Officer with assigned permissions
export interface HROfficer {
  UserID: string;
  Email: string;
  Name: string;
  AllowedActions: AllowedAction[];
  CreatedAt: string;
  AssignedBy: string;
}

// Authenticated User
export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: UserRole;
  allowedActions?: AllowedAction[];
}

// Activity Log
export interface ActivityLog {
  LogID: string;
  UserID: string;
  UserEmail: string;
  Action: string;
  ResourceType: "Employee" | "Document" | "User" | "Permission";
  ResourceID: string;
  Timestamp: string;
  Details?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDocuments: number;
  recentActivity: ActivityLog[];
}

// Form Data for Employee Creation/Edit
export interface EmployeeFormData {
  FirstName: string;
  LastName: string;
  Department: string;
  Position: string;
  Email: string;
  Phone?: string;
  Status: EmployeeStatus;
}

// Departments (configurable)
export const DEPARTMENTS = [
  "Human Resources",
  "Finance",
  "Information Technology",
  "Operations",
  "Marketing",
  "Legal",
  "Administration",
  "Procurement",
  "Audit",
  "Executive",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// Nav Items
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  requiredAction?: AllowedAction;
}
