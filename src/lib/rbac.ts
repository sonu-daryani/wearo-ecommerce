import type { Role } from "@prisma/client";

export type Permission =
  | "cms:read"
  | "cms:write"
  | "cms:publish"
  | "cms:delete"
  | "admin:access";

const ROLE_MATRIX: Record<Role, Permission[]> = {
  CUSTOMER: [],
  VIEWER: ["cms:read", "admin:access"],
  EDITOR: ["cms:read", "cms:write", "cms:publish", "admin:access"],
  ADMIN: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "cms:delete",
    "admin:access",
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_MATRIX[role]?.includes(permission) ?? false;
}

export function isStaffRole(role: Role | undefined | null): boolean {
  return role === "VIEWER" || role === "EDITOR" || role === "ADMIN";
}

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  VIEWER: "CMS Viewer",
  EDITOR: "CMS Editor",
  ADMIN: "Administrator",
};
