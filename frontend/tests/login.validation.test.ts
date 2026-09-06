/**
 * Unit tests for the login form Zod schema.
 *
 * These run without React — just pure schema validation.
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      username: "alice.johnson",
      password: "Password@123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "Password@123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.username).toContain("Username is required");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ username: "alice", password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        "Password must be at least 6 characters",
      );
    }
  });

  it("rejects missing password field", () => {
    const result = loginSchema.safeParse({ username: "alice" });
    expect(result.success).toBe(false);
  });

  it("rejects missing username field", () => {
    const result = loginSchema.safeParse({ password: "Password@123" });
    expect(result.success).toBe(false);
  });
});
