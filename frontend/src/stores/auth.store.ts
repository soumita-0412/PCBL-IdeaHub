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

  setAuth: (token: string, profile: UserProfile) => void;
  clearAuth: () => void;

  // Legacy helpers kept for internal use
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        userProfile: null,
        accessToken: null,
        isLoading: false,

        setAuth: (token, profile) =>
          set({ isAuthenticated: true, userProfile: profile, accessToken: token }),

        clearAuth: () =>
          set({ isAuthenticated: false, userProfile: null, accessToken: null }),

        setLoading: (isLoading) => set({ isLoading }),
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
      },
    ),
    { name: "AuthStore" },
  ),
);
