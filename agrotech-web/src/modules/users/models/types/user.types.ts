export const UserStatus = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  BLOQUEADO: 'bloqueado',
  PENDIENTE_VERIFICACION: 'pendiente_verificacion',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  idFicha?: string;
  telefono?: string;
  correo: string;
  estado: UserStatus;
  rolId?: number;
  rol?: {
    id: number;
    nombre: string;
  };
  permisos?: {
    id: number;
    accion: string;
    modulo: string;
  }[];
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  identificacion: string;
  idFicha?: string;
  telefono?: string;
  correo: string;
  password?: string;
  rolId?: number;
  estado?: UserStatus;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  identificacion?: string;
  idFicha?: string;
  telefono?: string;
  correo?: string;
  password?: string;
  rolId?: number;
  estado?: UserStatus;
  avatarUrl?: string;
}

export interface UserFilters {
  q?: string;
  rolId?: number;
  estado?: UserStatus;
  page?: number;
  limit?: number;
}
