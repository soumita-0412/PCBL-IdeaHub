/**
 * Auth Zustand store — persisted to sessionStorage so the session
 * clears automatically when the browser tab/window is closed.
 *
 * Phase 2: swap setAuth callers to an MSAL-based flow with no
 * changes to ProtectedRoute, RoleGuard, or permission logic.
 */
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { UserProfile } from "@/types/auth";

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  /** Token stored in sessionStorage only — never in a cookie. */
  accessToken: string | null;
  /** True once the store has finished loading from sessionStorage. */
  _hasHydrated: boolean;

  setAuth: (token: string, profile: UserProfile) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;

  // Legacy helpers kept for internal use
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const segment = token.split(".")[1];
  if (!segment) throw new Error("invalid jwt");
  // JWT uses base64url; convert to standard base64 before calling atob
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  return JSON.parse(atob(padded)) as Record<string, unknown>;
}

/** Returns true if the token is missing, malformed, or its exp claim is in the past. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = decodeJwtPayload(token);
    return typeof payload.exp !== "number" || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/** Returns ms until the token expires, or 0 if already expired / invalid. */
export function tokenExpiresIn(token: string | null): number {
  if (!token) return 0;
  try {
    const payload = decodeJwtPayload(token);
    if (typeof payload.exp !== "number") return 0;
    return Math.max(0, payload.exp * 1000 - Date.now());
  } catch {
    return 0;
  }
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        userProfile: null,
        accessToken: null,
        isLoading: false,
        _hasHydrated: false,

        setAuth: (token, profile) =>
          set({ isAuthenticated: true, userProfile: profile, accessToken: token }),

        clearAuth: () =>
          set({ isAuthenticated: false, userProfile: null, accessToken: null }),

        setLoading: (isLoading) => set({ isLoading }),

        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      {
        name: "ideas-auth",
        storage: createJSONStorage(() => sessionStorage),
        // Persist all auth fields — sessionStorage clears on tab close
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          userProfile: state.userProfile,
          accessToken: state.accessToken,
        }),
        // After loading from sessionStorage: clear expired tokens then mark ready
        onRehydrateStorage: () => (state) => {
          if (state) {
            if (isTokenExpired(state.accessToken)) {
              state.clearAuth();
            }
            state.setHasHydrated(true);
          }
        },
      },
    ),
    { name: "AuthStore" },
  ),
);
