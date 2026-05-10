import type { Role } from "@prisma/client";

export type Permission =
  | "cms:read"
  | "cms:create"
  | "cms:write"
  | "cms:publish"
  | "cms:delete"
  | "product:read"
  | "product:create"
  | "product:write"
  | "product:delete"
  | "admin:access";

const ROLE_MATRIX: Record<Role, Permission[]> = {
  CUSTOMER: [],
  VIEWER: ["cms:read", "product:read", "admin:access"],
  CONTRIBUTOR: ["cms:create", "product:create", "admin:access"],
  EDITOR: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "product:read",
    "product:write",
    "admin:access",
  ],
  ADMIN: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "cms:delete",
    "product:read",
    "product:write",
    "product:delete",
    "admin:access",
  ],
  SUPERADMIN: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "cms:delete",
    "product:read",
    "product:write",
    "product:delete",
    "admin:access",
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_MATRIX[role]?.includes(permission) ?? false;
}

export function isStaffRole(role: Role | undefined | null): boolean {
  return (
    role === "VIEWER" ||
    role === "CONTRIBUTOR" ||
    role === "EDITOR" ||
    role === "ADMIN" ||
    role === "SUPERADMIN"
  );
}

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  VIEWER: "CMS Viewer",
  CONTRIBUTOR: "Contributor",
  EDITOR: "CMS Editor",
  ADMIN: "Administrator",
  SUPERADMIN: "Super admin",
};
