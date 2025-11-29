import { api } from '@/shared/api/client';
import type { Rol, Permiso, CreateRolDto, CreatePermisoDto } from '../models/types/permissions.types';

// ==================== PERMISOS ====================

export const getPermisos = async (): Promise<Permiso[]> => {
  const { data } = await api.get<Permiso[]>('/permissions/permisos');
  return data;
};

export const createPermiso = async (permiso: CreatePermisoDto): Promise<Permiso> => {
  const { data } = await api.post<Permiso>('/permissions/permisos', permiso);
  return data;
};

export const updatePermiso = async (id: number, permiso: Partial<CreatePermisoDto>): Promise<Permiso> => {
  const { data } = await api.put<Permiso>(`/permissions/permisos/${id}`, permiso);
  return data;
};

export const deletePermiso = async (id: number): Promise<void> => {
  await api.delete(`/permissions/permisos/${id}`);
};

// ==================== ROLES ====================

export const getRoles = async (): Promise<Rol[]> => {
  const { data } = await api.get<Rol[]>('/permissions/roles');
  return data;
};

export const createRol = async (rol: CreateRolDto): Promise<Rol> => {
  const { data } = await api.post<Rol>('/permissions/roles', rol);
  return data;
};

export const updateRol = async (id: number, rol: Partial<CreateRolDto>): Promise<Rol> => {
  const { data } = await api.put<Rol>(`/permissions/roles/${id}`, rol);
  return data;
};

export const deleteRol = async (id: number): Promise<void> => {
  await api.delete(`/permissions/roles/${id}`);
};

// ==================== PERMISOS DE ROL ====================

export const getPermisosByRol = async (rolId: number): Promise<Permiso[]> => {
  const { data } = await api.get<Permiso[]>(`/permissions/roles/${rolId}/permisos`);
  return data;
};

export const assignPermisoToRol = async (rolId: number, permisoId: number): Promise<void> => {
  await api.post(`/permissions/roles/${rolId}/permisos/${permisoId}`);
};

export const removePermisoFromRol = async (rolId: number, permisoId: number): Promise<void> => {
  await api.delete(`/permissions/roles/${rolId}/permisos/${permisoId}`);
};

export const syncPermisosRol = async (rolId: number, permisoIds: number[]): Promise<void> => {
  await api.post(`/permissions/roles/${rolId}/permisos/sync`, { permisoIds });
};

// ==================== PERMISOS DE USUARIO ====================

export const getUserPermissions = async (userId: number): Promise<Permiso[]> => {
  const { data } = await api.get<Permiso[]>(`/permissions/usuarios/${userId}/permisos/directos`);
  return data;
};

export const syncUserPermissions = async (userId: number, permisoIds: number[]): Promise<void> => {
  await api.post(`/users/${userId}/permissions/sync`, { permisoIds });
};
