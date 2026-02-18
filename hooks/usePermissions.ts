"use client";

import { useAuth } from "@/hooks/useAuth";
import { AllowedAction, UserRole } from "@/types";
import { hasPermission, hasRole } from "@/lib/auth";

export function usePermissions() {
  const { user } = useAuth();

  const can = (action: AllowedAction): boolean => hasPermission(user, action);

  const is = (roles: UserRole | UserRole[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return hasRole(user, roleArray);
  };

  const isAtLeast = (role: UserRole): boolean => {
    if (!user) return false;
    const hierarchy: UserRole[] = ["HROfficer", "HRManager", "SuperAdmin"];
    const userLevel = hierarchy.indexOf(user.role);
    const requiredLevel = hierarchy.indexOf(role);
    return userLevel >= requiredLevel;
  };

  return { can, is, isAtLeast, user };
}
