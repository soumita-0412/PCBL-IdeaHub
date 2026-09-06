export const Roles = {
  EMPLOYEE: "ROLE_EMPLOYEE",
  L1_REVIEWER: "ROLE_L1_REVIEWER",
  FUNCTIONAL_REVIEWER: "ROLE_FUNCTIONAL_REVIEWER",
  FUNCTIONAL_HEAD: "ROLE_FUNCTIONAL_HEAD",
  ADMIN: "ROLE_ADMIN",
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

/** Ordered from lowest to highest privilege — mirrors the backend hierarchy. */
export const ROLE_HIERARCHY: Role[] = [
  Roles.EMPLOYEE,
  Roles.L1_REVIEWER,
  Roles.FUNCTIONAL_REVIEWER,
  Roles.FUNCTIONAL_HEAD,
  Roles.ADMIN,
  Roles.SUPER_ADMIN,
];

export function hasMinRole(userRole: string, minRole: Role): boolean {
  const userIdx = ROLE_HIERARCHY.indexOf(userRole as Role);
  const minIdx = ROLE_HIERARCHY.indexOf(minRole);
  return userIdx >= 0 && userIdx >= minIdx;
}

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_EMPLOYEE: "Employee",
  ROLE_L1_REVIEWER: "Manager",
  ROLE_FUNCTIONAL_REVIEWER: "Functional Reviewer",
  ROLE_FUNCTIONAL_HEAD: "Functional Head",
  ROLE_ADMIN: "Admin",
  ROLE_SUPER_ADMIN: "Super Admin",
};
