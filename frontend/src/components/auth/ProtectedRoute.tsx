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
  const { isAuthenticated, userProfile, accessToken, clearAuth, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const tokenExpired = isTokenExpired(accessToken);

  useEffect(() => {
    // Wait until sessionStorage has been read before making any auth decision
    if (!_hasHydrated) return;

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
  }, [_hasHydrated, isAuthenticated, tokenExpired, userProfile, allowedRoles, router, clearAuth]);

  // Show nothing until the store has loaded from sessionStorage
  if (!_hasHydrated) {
    return null;
  }

  if (!isAuthenticated || tokenExpired) {
    return null;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}
