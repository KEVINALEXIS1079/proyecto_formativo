export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
  estado: 'ACTIVO' | 'INACTIVO';
  avatarUrl?: string;
  telefono?: string;
  idFicha?: string;
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rolId: number;
  idFicha?: string;
  telefono?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  rolId?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
  telefono?: string;
}

export interface Lote {
  id: number;
  nombre: string;
  descripcion?: string;
  area: number;
  sublotes?: SubLote[];
}

export interface SubLote {
  id: number;
  nombre: string;
  area: number;
  loteId: number;
}

export interface CreateLoteDto {
  nombre: string;
  descripcion?: string;
  area: number;
}

export interface CreateSubLoteDto {
  nombre: string;
  area: number;
  loteId: number;
}

export interface Cultivo {
  id: number;
  nombreCultivo: string;
  nombre?: string; // Legacy/Fallback
  tipoCultivo: string | { id: number; nombre: string }; // Can be string or object from relations
  variedad?: string;
  fechaSiembra: string;
  fechaCosechaEstimada?: string;
  area?: number;
  estado: 'ACTIVO' | 'COSECHADO' | 'FINALIZADO' | 'activo' | 'inactivo' | 'finalizado';
  loteId?: number;
  subloteId?: number;
  subLoteId?: number;
  imgCultivo?: string;
  imagen?: string;
  descripcion?: string;
  costoTotal?: number;
  lote?: { id: number; nombre: string };
  sublote?: { id: number; nombre: string };
  subLote?: { id: number; nombre: string };
}

export interface CreateCultivoDto {
  nombre: string;
  variedad: string;
  fechaSiembra: string;
  area: number;
  loteId?: number;
  subloteId?: number;
}

export interface Insumo {
  id: number;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  categoriaId: number;
  almacenId: number;
  proveedorId: number;
  fotoUrl?: string;
  categoria?: { id: number; nombre: string };
  almacen?: { id: number; nombre: string };
  proveedor?: { id: number; nombre: string };
}

export interface CreateInsumoDto {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  categoriaId: number;
  almacenId: number;
  proveedorId: number;
}

export interface Activity {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaProgramada: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  tipo: 'FERTILIZACION' | 'RIEGO' | 'PODA' | 'COSECHA' | 'OTRO';
  cultivoId?: number;
  loteId?: number;
}

export interface CreateActivityDto {
  nombre: string;
  descripcion?: string;
  fechaProgramada: string;
  tipo: string;
  cultivoId?: number;
  loteId?: number;
}

export interface CategoriaInsumo {
  id: number;
  nombre: string;
}

export interface Almacen {
  id: number;
  nombre: string;
}

export interface Permission {
  id: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: Permission[];
}

export interface CreateRoleDto {
  nombre: string;
  descripcion?: string;
  permisosIds: number[];
}

export interface UpdateRoleDto {
  nombre?: string;
  descripcion?: string;
  permisosIds?: number[];
}

export interface CreatePermissionDto {
  nombre: string;
  descripcion?: string;
  modulo: string;
}

export interface UpdatePermissionDto {
  nombre?: string;
  descripcion?: string;
  modulo?: string;
}
