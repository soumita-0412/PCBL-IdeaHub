/**
 * useAuth — credential-based auth hook (Phase 1).
 *
 * Phase 2 SSO: login/logout stay unchanged. SSO flow runs entirely via
 * browser navigation through the backend OAuth callback — no hook changes needed.
 */
"use client";

import { useState } from "react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, type Role } from "@/constants/roles";
import type { UserProfile } from "@/types/auth";

export interface UseAuthReturn {
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (minRole: Role) => boolean;
}

export function useAuth(): UseAuthReturn {
  const { isAuthenticated, userProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.login(username, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (minRole: Role): boolean => {
    if (!userProfile) return false;
    return hasMinRole(userProfile.role, minRole);
  };

  return {
    isAuthenticated,
    user: userProfile,
    role: userProfile?.role ?? null,
    isLoading,
    login,
    logout,
    hasRole,
  };
}
