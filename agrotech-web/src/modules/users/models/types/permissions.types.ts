export interface Permiso {
  id: number;
  modulo: string;
  accion: string;
  clave: string;
  descripcion?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos?: Permiso[];
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateRolDto extends Partial<CreateRolDto> {}

export interface CreatePermisoDto {
  modulo: string;
  accion: string;
  clave: string;
  descripcion?: string;
}

export interface SyncPermisosDto {
  permisoIds: number[];
}
