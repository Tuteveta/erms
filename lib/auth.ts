import { AuthUser, UserRole, AllowedAction } from "@/types";

// Cognito group name to UserRole mapping
export function mapGroupToRole(groups: string[]): UserRole {
  if (groups.includes("SuperAdmin")) return "SuperAdmin";
  if (groups.includes("HRManager")) return "HRManager";
  if (groups.includes("HROfficer")) return "HROfficer";
  return "HROfficer";
}

// Check if a user has a specific permission
export function hasPermission(user: AuthUser | null, action: AllowedAction): boolean {
  if (!user) return false;
  if (user.role === "SuperAdmin" || user.role === "HRManager") return true;
  return user.allowedActions?.includes(action) ?? false;
}

// Check if user has a role
export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Get role display label
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SuperAdmin: "Super Admin",
    HRManager: "HR Manager",
    HROfficer: "HR Officer",
  };
  return labels[role];
}

// Get role badge color class
export function getRoleBadgeClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
    SuperAdmin: "bg-purple-100 text-purple-800",
    HRManager: "bg-blue-100 text-blue-800",
    HROfficer: "bg-green-100 text-green-800",
  };
  return classes[role];
}

// Default permissions per role (for reference)
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, AllowedAction[]> = {
  SuperAdmin: [
    "CREATE_EMPLOYEE",
    "EDIT_EMPLOYEE",
    "DELETE_EMPLOYEE",
    "VIEW_EMPLOYEE",
    "UPLOAD_DOCUMENTS",
    "VIEW_DOCUMENTS",
    "GENERATE_REPORTS",
  ],
  HRManager: [
    "CREATE_EMPLOYEE",
    "EDIT_EMPLOYEE",
    "DELETE_EMPLOYEE",
    "VIEW_EMPLOYEE",
    "UPLOAD_DOCUMENTS",
    "VIEW_DOCUMENTS",
    "GENERATE_REPORTS",
  ],
  HROfficer: ["VIEW_EMPLOYEE"],
};

// Action display labels
export const ACTION_LABELS: Record<AllowedAction, string> = {
  CREATE_EMPLOYEE: "Create Employee Records",
  EDIT_EMPLOYEE: "Edit Employee Records",
  DELETE_EMPLOYEE: "Delete Employee Records",
  VIEW_EMPLOYEE: "View Employee Records",
  UPLOAD_DOCUMENTS: "Upload Documents",
  VIEW_DOCUMENTS: "View Documents",
  GENERATE_REPORTS: "Generate Reports",
};
