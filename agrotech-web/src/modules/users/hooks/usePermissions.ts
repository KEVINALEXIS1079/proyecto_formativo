import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getPermisos,
  createRol,
  updateRol,
  deleteRol,
  getPermisosByRol,
  syncPermisosRol,
  createPermiso,
  updatePermiso,
  deletePermiso,
  getUserPermissions,
  syncUserPermissions,
} from '../api/permissions.api';
import type { CreateRolDto, CreatePermisoDto } from '../models/types/permissions.types';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
};

export const usePermisos = () => {
  return useQuery({
    queryKey: ['permisos'],
    queryFn: getPermisos,
  });
};

export const useCreatePermiso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permiso: CreatePermisoDto) => createPermiso(permiso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

export const useUpdatePermiso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePermisoDto> }) =>
      updatePermiso(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

export const useDeletePermiso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePermiso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
    },
  });
};

export const useCreateRol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rol: CreateRolDto) => createRol(rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre, descripcion }: { id: number; nombre: string; descripcion?: string }) =>
      updateRol(id, { nombre, descripcion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const usePermisosByRol = (rolId: number | null) => {
  return useQuery({
    queryKey: ['roles', rolId, 'permisos'],
    queryFn: () => getPermisosByRol(rolId!),
    enabled: !!rolId,
  });
};

export const useSyncPermisosRol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rolId, permisoIds }: { rolId: number; permisoIds: number[] }) =>
      syncPermisosRol(rolId, permisoIds),
    onSuccess: (_, { rolId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', rolId, 'permisos'] });
    },
  });
};

export const useUserPermissions = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['users', userId, 'permissions'],
    queryFn: () => getUserPermissions(userId!),
    enabled: !!userId,
  });
};

export const useSyncUserPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permisoIds }: { userId: number; permisoIds: number[] }) =>
      syncUserPermissions(userId, permisoIds),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Also invalidate users list to update permissions count if needed
    },
  });
};
