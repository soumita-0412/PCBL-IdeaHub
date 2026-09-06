/**
 * Unit tests for useAuth hook.
 *
 * Mocks authService so no HTTP calls are made.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import * as authServiceModule from "@/services/authService";
import { Roles } from "@/constants/roles";

const MOCK_PROFILE = {
  userId: "EMP001",
  username: "alice.johnson",
  name: "Alice Johnson",
  email: "alice@test.com",
  department: "Operations",
  function: "Supply Chain",
  location: "New York",
  manager: "bob.smith",
  role: Roles.EMPLOYEE,
};

beforeEach(() => {
  useAuthStore.getState().clearAuth();
});

describe("useAuth", () => {
  it("returns isAuthenticated=false when no session", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("login() calls authService.login and updates store", async () => {
    const spy = vi
      .spyOn(authServiceModule.authService, "login")
      .mockImplementation(async () => {
        useAuthStore.getState().setAuth("mock-token", MOCK_PROFILE);
      });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("alice.johnson", "Password@123");
    });

    expect(spy).toHaveBeenCalledWith("alice.johnson", "Password@123");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.userId).toBe("EMP001");
  });

  it("logout() calls authService.logout and clears store", async () => {
    useAuthStore.getState().setAuth("tok", MOCK_PROFILE);
    const spy = vi
      .spyOn(authServiceModule.authService, "logout")
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(spy).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("hasRole returns true for matching role", () => {
    useAuthStore.getState().setAuth("tok", MOCK_PROFILE);
    const { result } = renderHook(() => useAuth());
    expect(result.current.hasRole(Roles.EMPLOYEE)).toBe(true);
  });

  it("hasRole returns false for role above user level", () => {
    useAuthStore.getState().setAuth("tok", MOCK_PROFILE);
    const { result } = renderHook(() => useAuth());
    expect(result.current.hasRole(Roles.ADMIN)).toBe(false);
  });
});
