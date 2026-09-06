"use client";

import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, type Role } from "@/constants/roles";

interface RoleGuardProps {
  /** Render children only if the user has this role or higher. */
  minRole?: Role;
  /** Render children only if the user has exactly one of these roles. */
  roles?: string[];
  children: React.ReactNode;
  /** Rendered when the user doesn't meet the role requirement. */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's role.
 * Does NOT redirect — use ProtectedRoute for redirect behaviour.
 */
export function RoleGuard({ minRole, roles, children, fallback = null }: RoleGuardProps) {
  const { userProfile } = useAuthStore();

  if (!userProfile) return <>{fallback}</>;

  if (minRole && !hasMinRole(userProfile.role, minRole)) return <>{fallback}</>;
  if (roles && !roles.includes(userProfile.role)) return <>{fallback}</>;

  return <>{children}</>;
}
