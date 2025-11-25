export type RolLite = { id: number; nombre: string; usuariosCount?: number };
export type UsuarioLite = { id: number; nombre: string; cedula: string; id_ficha: number; rol: string };
export type ModuloLite = { id: number | string; nombre: string; code?: string };

export type PermisoCatalogo = {
  id: number;
  accion: string;
  modulo: string;           // nombre del módulo
  permisoCompleto: string;  // modulo:accion
  selected?: boolean;
  fuente?: "usuario" | "rol" | null;
  module?: { id: number; nombre: string };
};

export type UsersPage = {
  items: UsuarioLite[];
  page: number;
  total: number;
  hasMore: boolean;
};

export type RoleUserCount = { id: number; nombre: string; usuarios: number };
