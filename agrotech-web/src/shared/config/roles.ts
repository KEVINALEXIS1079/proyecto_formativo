// shared/config/roles.ts
// Roles y permisos base

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  // Usuarios
  USUARIOS_READ: "usuarios:read",
  USUARIOS_WRITE: "usuarios:write",
  USUARIOS_DELETE: "usuarios:delete",

  // Inventario
  INVENTARIO_READ: "inventario:read",
  INVENTARIO_WRITE: "inventario:write",

  // Actividades
  ACTIVIDADES_READ: "actividades:read",
  ACTIVIDADES_WRITE: "actividades:write",

  // Etc.
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];