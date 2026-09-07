"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore, isTokenExpired } from "@/stores/auth.store";

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
  const { isAuthenticated, userProfile, accessToken, clearAuth } = useAuthStore();
  const router = useRouter();

  const tokenExpired = isTokenExpired(accessToken);

  useEffect(() => {
    if (!isAuthenticated || tokenExpired) {
      if (tokenExpired && isAuthenticated) {
        clearAuth();
      }
      router.replace("/login");
      return;
    }
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
      router.replace("/forbidden");
    }
  }, [isAuthenticated, tokenExpired, userProfile, allowedRoles, router, clearAuth]);

  if (!isAuthenticated || tokenExpired) {
    return null;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}
