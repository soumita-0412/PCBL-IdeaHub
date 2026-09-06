"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user must have one of these roles (exact match). */
  allowedRoles?: string[];
}

/**
 * Wraps a page or layout to enforce authentication and optional RBAC.
 *
 * - Unauthenticated → redirects to /login
 * - Authenticated but wrong role → redirects to /forbidden
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, userProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
      router.replace("/forbidden");
    }
  }, [isAuthenticated, userProfile, allowedRoles, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}
