/**
 * Constantes de roles del sistema
 * Estos IDs deben coincidir con los roles creados en las seeds
 */
export const ROLES = {
  ADMINISTRADOR: 1,
  INSTRUCTOR: 2,
  APRENDIZ: 3,
  PASANTE: 4,
  INVITADO: 5,
} as const;

export type RoleId = typeof ROLES[keyof typeof ROLES];
