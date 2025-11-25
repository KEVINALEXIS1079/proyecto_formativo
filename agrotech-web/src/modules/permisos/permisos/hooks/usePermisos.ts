// src/modules/permisos/hooks/usePermisos.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listRoles,
  listRolesEliminados,
  getRoleUserCounts,
  getPermisosForUserSelection,
  getPermisosForRoleSelection,
  togglePermisoOnUser,
  togglePermisoOnRole,
  assignPermisosToUser,
  crearRol,
  renombrarRol,
  eliminarRol,
  restaurarRol,
  permisoService,
  listPermisoModules,
} from "../api/permiso.service";

/* ======================
 * Tipos de selección
 * ====================== */
export type PermisoSel = { id: number; nombre: string; selected: boolean; fuente?: "usuario" | "rol" | null };
export type PermisosSelectionResp = { total: number; permisos: PermisoSel[] };

/* ======================
 * Query Keys
 * ====================== */
export const qk = {
  rolesActivos: () => ["roles", "activos"] as const,
  rolesEliminados: () => ["roles", "eliminados"] as const,
  rolesCounts: () => ["roles", "counts"] as const,
  permisosUserSel: (userId?: number, moduleId?: number) =>
    ["permisos", "userSel", { userId, moduleId }] as const,
  permisosRoleSel: (roleId?: number, moduleId?: number) =>
    ["permisos", "roleSel", { roleId, moduleId }] as const,
};

export const qkModules = { list: () => ["permiso", "modules"] as const };

/* ======================
 * Lecturas
 * ====================== */
export function useRolesActivos() {
  const qc = useQueryClient();

  const roles = useQuery({
    queryKey: qk.rolesActivos(),
    queryFn: listRoles,
    staleTime: 20_000,
  });

  const counts = useQuery({
    queryKey: qk.rolesCounts(),
    queryFn: getRoleUserCounts,
    staleTime: 10_000,
  });

  useEffect(() => {
    const cleanups = [
      permisoService.onRolEvents(() => {
        qc.invalidateQueries({ queryKey: qk.rolesActivos() });
        qc.invalidateQueries({ queryKey: qk.rolesEliminados() });
        qc.invalidateQueries({ queryKey: qk.rolesCounts() });
      }),
      permisoService.onPermisoRoleChanged(() => {
        qc.invalidateQueries({ queryKey: qk.rolesCounts() });
      }),
    ];
    return () => cleanups.forEach((off) => off());
  }, [qc]);

  return { roles, counts };
}

export function useRolesEliminados() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.rolesEliminados(),
    queryFn: listRolesEliminados,
    select: (data: any) => (Array.isArray(data) ? data : data?.items ?? data?.data ?? []),
    staleTime: 10_000,
    refetchOnMount: "always",
  });

  useEffect(() => {
    const off = permisoService.onRolEvents(() => {
      qc.invalidateQueries({ queryKey: qk.rolesEliminados() });
    });
    return off;
  }, [qc]);

  return query;
}

export function usePermisoModules() {
  return useQuery({
    queryKey: qkModules.list(),
    queryFn: listPermisoModules,
    staleTime: 60_000,
  });
}

export function usePermisosUserSelection(userId?: number, moduleId?: number) {
  const qc = useQueryClient();
  const enabled = Boolean(userId);

  const query = useQuery<PermisosSelectionResp>({
    enabled,
    queryKey: qk.permisosUserSel(userId, moduleId),
    queryFn: async () => {
      const resp = await getPermisosForUserSelection(userId!, moduleId);
      return {
        total: resp.total,
        permisos: resp.permisos.map((p: any) => ({
          id: p.id,
          nombre: p.permisoCompleto ?? `${p.modulo ?? p.module?.nombre ?? ""}:${p.accion ?? ""}`,
          selected: Boolean(p.selected),
          fuente: p.fuente,
        })),
      } as PermisosSelectionResp;
    },
  });

  // WS: refrescar la lista visible (user+module)
  useEffect(() => {
    if (!enabled) return;
    const cleanups = [
      permisoService.onPermisoChanged(() =>
        qc.invalidateQueries({ queryKey: qk.permisosUserSel(userId, moduleId) })
      ),
      permisoService.onPermisoUserChanged(() =>
        qc.invalidateQueries({ queryKey: qk.permisosUserSel(userId, moduleId) })
      ),
      permisoService.onRolEvents(() =>
        qc.invalidateQueries({ queryKey: qk.permisosUserSel(userId, moduleId) })
      ),
    ];
    return () => cleanups.forEach((off) => off());
  }, [qc, enabled, userId, moduleId]);

  return query;
}

export function usePermisosRoleSelection(roleId?: number, moduleId?: number) {
  const qc = useQueryClient();
  const enabled = Boolean(roleId);

  const query = useQuery<PermisosSelectionResp>({
    enabled,
    queryKey: qk.permisosRoleSel(roleId, moduleId),
    queryFn: async () => {
      const resp = await getPermisosForRoleSelection(roleId!, moduleId);
      return {
        total: resp.total,
        permisos: resp.permisos.map((p: any) => ({
          id: p.id,
          nombre: p.permisoCompleto ?? `${p.modulo ?? p.module?.nombre ?? ""}:${p.accion ?? ""}`,
          selected: Boolean(p.selected),
        })),
      } as PermisosSelectionResp;
    },
  });

  // WS: refrescar la lista visible (role+module)
  useEffect(() => {
    if (!enabled) return;
    const cleanups = [
      permisoService.onPermisoChanged(() =>
        qc.invalidateQueries({ queryKey: qk.permisosRoleSel(roleId, moduleId) })
      ),
      permisoService.onPermisoRoleChanged(() =>
        qc.invalidateQueries({ queryKey: qk.permisosRoleSel(roleId, moduleId) })
      ),
    ];
    return () => cleanups.forEach((off) => off());
  }, [qc, enabled, roleId, moduleId]);

  return query;
}

/* ======================
  * Mutaciones con UI optimista
  * ====================== */

// USER ⇢ assign bulk
export function useAssignPermisosToUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: number; permisoIds: number[]; moduleId?: number }) =>
      assignPermisosToUser(p.userId, p.permisoIds),

    // Optimistic UI: marcar como selected los permisos asignados
    onMutate: async (vars) => {
      const key = qk.permisosUserSel(vars.userId, vars.moduleId);
      await qc.cancelQueries({ queryKey: key });

      const prev = qc.getQueryData<PermisosSelectionResp>(key);
      qc.setQueryData<PermisosSelectionResp>(key, (old) => {
        if (!old) return old as any;
        return {
          ...old,
          permisos: old.permisos.map((p) =>
            vars.permisoIds.includes(p.id) ? { ...p, selected: true, fuente: 'usuario' } : p
          ),
        };
      });
      return { prev, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev); // rollback
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: qk.permisosUserSel(vars.userId, vars.moduleId) });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });
}

// USER ⇢ toggle
export function useTogglePermisoOnUser() {
  const qc = useQueryClient();
  return useMutation({
    // ⬇️ reciba también moduleId para invalidar la query correcta
    mutationFn: (p: { userId: number; permisoId: number; enable: boolean; moduleId?: number }) =>
      togglePermisoOnUser(p.userId, p.permisoId, p.enable),

    // Optimistic UI: reflejar el cambio al instante
    onMutate: async (vars) => {
      const key = qk.permisosUserSel(vars.userId, vars.moduleId);
      await qc.cancelQueries({ queryKey: key });

      const prev = qc.getQueryData<PermisosSelectionResp>(key);
      qc.setQueryData<PermisosSelectionResp>(key, (old) => {
        if (!old) return old as any;
        return {
          ...old,
          permisos: old.permisos.map((p) =>
            p.id === vars.permisoId ? { ...p, selected: vars.enable } : p
          ),
        };
      });
      return { prev, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev); // rollback
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: qk.permisosUserSel(vars.userId, vars.moduleId) });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });
}

// ROLE ⇢ toggle
export function useTogglePermisoOnRole() {
  const qc = useQueryClient();
  return useMutation({
    // ⬇️ reciba también moduleId para invalidar la query correcta
    mutationFn: (p: { roleId: number; permisoId: number; enable: boolean; moduleId?: number }) =>
      togglePermisoOnRole(p.roleId, p.permisoId, p.enable),

    // Optimistic UI
    onMutate: async (vars) => {
      const key = qk.permisosRoleSel(vars.roleId, vars.moduleId);
      await qc.cancelQueries({ queryKey: key });

      const prev = qc.getQueryData<PermisosSelectionResp>(key);
      qc.setQueryData<PermisosSelectionResp>(key, (old) => {
        if (!old) return old as any;
        return {
          ...old,
          permisos: old.permisos.map((p) =>
            p.id === vars.permisoId ? { ...p, selected: vars.enable } : p
          ),
        };
      });
      return { prev, key };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev); // rollback
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: qk.permisosRoleSel(vars.roleId, vars.moduleId) });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });
}

/* ======================
 * CRUD de Roles
 * ====================== */
export function useRolesCrud() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (nombre: string) => crearRol(nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.rolesActivos() });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });

  const rename = useMutation({
    mutationFn: (p: { id: number; nombre: string }) => renombrarRol(p.id, p.nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.rolesActivos() });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => eliminarRol(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.rolesActivos() });
      qc.invalidateQueries({ queryKey: qk.rolesEliminados() });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });

  const restore = useMutation({
    mutationFn: (id: number) => restaurarRol(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.rolesActivos() });
      qc.invalidateQueries({ queryKey: qk.rolesEliminados() });
      qc.invalidateQueries({ queryKey: qk.rolesCounts() });
    },
  });

  return { create, rename, remove, restore };
}
