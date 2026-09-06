/**
 * Unit tests for ProtectedRoute component.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/auth.store";
import { Roles } from "@/constants/roles";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const MOCK_REPLACE = vi.fn();

const EMPLOYEE_PROFILE = {
  userId: "EMP001",
  username: "alice",
  name: "Alice Johnson",
  email: "alice@test.com",
  department: "Ops",
  function: "SC",
  location: "NY",
  manager: "bob",
  role: Roles.EMPLOYEE,
};

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ replace: MOCK_REPLACE } as ReturnType<typeof useRouter>);
  MOCK_REPLACE.mockClear();
  useAuthStore.getState().clearAuth();
});

describe("ProtectedRoute", () => {
  it("redirects to /login when unauthenticated", () => {
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );
    expect(MOCK_REPLACE).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("renders children when authenticated", () => {
    useAuthStore.getState().setAuth("tok", EMPLOYEE_PROFILE);
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText("Protected content")).toBeDefined();
    expect(MOCK_REPLACE).not.toHaveBeenCalledWith("/login");
  });

  it("redirects to /forbidden when authenticated but role not allowed", () => {
    useAuthStore.getState().setAuth("tok", EMPLOYEE_PROFILE);
    render(
      <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
        <div>Admin only</div>
      </ProtectedRoute>,
    );
    expect(MOCK_REPLACE).toHaveBeenCalledWith("/forbidden");
    expect(screen.queryByText("Admin only")).toBeNull();
  });

  it("renders children when role is in allowedRoles", () => {
    useAuthStore.getState().setAuth("tok", EMPLOYEE_PROFILE);
    render(
      <ProtectedRoute allowedRoles={[Roles.EMPLOYEE, Roles.L1_REVIEWER]}>
        <div>Allowed content</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText("Allowed content")).toBeDefined();
  });
});
