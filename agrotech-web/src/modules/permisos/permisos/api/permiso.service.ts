import api, { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

/* =========================
 * Tipos
 * ========================= */
export type PermisoFuente = "usuario" | "rol" | null;

export type PermisoCatalogo = {
  id: number;
  accion: string;
  modulo: string;
  permisoCompleto: string;
  selected?: boolean;
  fuente?: PermisoFuente;
  module?: { id: number; nombre: string };
};

export type RolLite = { id: number; nombre: string; usuariosCount?: number };
export type RoleUserCount = { id: number; nombre: string; usuarios: number };

/* =========================
 * Helpers defensivos
 * ========================= */
function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// “Eliminado” ⇢ tiene fecha en delete_at (o variantes)
function isDeleted(x: any): boolean {
  return Boolean(x?.delete_at ?? x?.deleted_at ?? x?.deletedAt ?? null);
}

function adaptRolLite(x: any): RolLite {
  return {
    id: x?.id_rol_pk ?? x?.id ?? 0,
    nombre: x?.nombre_rol ?? x?.nombre ?? "",
    usuariosCount: x?.usuariosCount ?? x?.usuarios ?? undefined,
  };
}

function adaptCounts(list: any[]): RoleUserCount[] {
  return (list ?? []).map((r) => ({
    id: r?.id_rol_pk ?? r?.id ?? 0,
    nombre: r?.nombre_rol ?? r?.nombre ?? "",
    usuarios: Number(r?.usuarios ?? r?.usuariosCount ?? 0),
  }));
}

function adaptPermiso(x: any): PermisoCatalogo {
  return {
    id: x?.id_permiso_pk ?? x?.id ?? 0,
    accion: x?.accion ?? "",
    modulo: x?.modulo ?? x?.module?.nombre ?? "",
    permisoCompleto:
      x?.permisoCompleto ??
      [x?.modulo ?? x?.module?.nombre, x?.accion].filter(Boolean).join(":"),
    selected: Boolean(x?.selected),
    fuente: (x?.fuente ?? null) as PermisoFuente,
    module: x?.module
      ? {
          id: x?.module?.id_permiso_module_pk ?? x?.module?.id ?? 0,
          nombre: x?.module?.nombre ?? "",
        }
      : undefined,
  };
}

/* =========================
 * Roles: fetch-all + filtro por delete_at
 * ========================= */
async function fetchAllRoles(): Promise<any[]> {
  // Probamos variantes comunes para garantizar que traemos soft-deleted
  const candidates: Array<() => Promise<any[]>> = [
    async () => toArray((await api.get("/roles", { params: { withDeleted: true } })).data),
    async () => toArray((await api.get("/roles", { params: { deleted: true } })).data),
    async () => toArray((await api.get("/roles/all")).data),
    async () => toArray((await api.get("/roles")).data), // fallback (podría traer solo activos)
  ];

  for (const fn of candidates) {
    try {
      const list = await fn();
      if (Array.isArray(list)) return list;
    } catch {
      // intenta la siguiente
    }
  }
  return [];
}

/* =========================
 * Servicio
 * ========================= */
class PermisoService {
  // ===== WebSockets (opcional)
  private sPermisos: Socket | null = null;
  private sRoles: Socket | null = null;

  private permisosNs(): string {
    return (import.meta.env.VITE_PERMISOS_WS_NS as string) || "/permisos";
  }
  private rolesNs(): string {
    return (import.meta.env.VITE_ROLES_WS_NS as string) || "/roles";
  }

  private socketPermisos(): Socket {
    if (this.sPermisos?.connected) return this.sPermisos!;
    this.sPermisos = connectSocket(this.permisosNs());
    return this.sPermisos!;
  }
  private socketRoles(): Socket {
    if (this.sRoles?.connected) return this.sRoles!;
    this.sRoles = connectSocket(this.rolesNs());
    return this.sRoles!;
  }

  /* ===== Roles (activos / eliminados) ===== */
  async listRoles(): Promise<RolLite[]> {
    const raw = await fetchAllRoles();
    return raw.filter((r) => !isDeleted(r)).map(adaptRolLite);
  }

  async listRolesEliminados(): Promise<RolLite[]> {
    const raw = await fetchAllRoles();
    return raw.filter(isDeleted).map(adaptRolLite);
  }

  async getRoleUserCounts(): Promise<RoleUserCount[]> {
    console.log("DEBUG: Llamando a getRoleUserCounts");
    try {
      const { data } = await api.get("/roles/user-counts");
      console.log("DEBUG: Respuesta de /roles/user-counts:", data);
      const result = adaptCounts(toArray(data));
      console.log("DEBUG: Resultado adaptado:", result);
      return result;
    } catch (error) {
      console.error("DEBUG: Error en getRoleUserCounts:", error);
      throw error;
    }
  }

  async crearRol(nombre: string): Promise<RolLite> {
    const { data } = await api.post("/roles", { nombre_rol: nombre });
    return adaptRolLite(data);
  }

  async renombrarRol(id: number, nuevoNombre: string): Promise<void> {
    await api.patch(`/roles/${id}`, { nombre_rol: nuevoNombre });
  }

  async eliminarRol(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  }

  async restaurarRol(id: number): Promise<void> {
    try {
      await api.patch(`/roles/restore/${id}`);
    } catch {
      await api.patch(`/roles/${id}/restore`, {});
    }
  }

  /* ===== Permisos: catálogo / selección ===== */
  async getPermisosForUserSelection(
    userId: number,
    moduleId?: number
  ): Promise<{ total: number; permisos: PermisoCatalogo[] }> {
    const { data } = await api.get(`/permisos/selection/user/${userId}`, {
      params: { moduleId },
    });
    const list = (data?.permisos ?? data?.items ?? data) as any[];
    return { total: Number(data?.total ?? list?.length ?? 0), permisos: (list ?? []).map(adaptPermiso) };
  }

  async getPermisosForRoleSelection(
    roleId: number,
    moduleId?: number
  ): Promise<{ total: number; permisos: PermisoCatalogo[] }> {
    const { data } = await api.get(`/permisos/selection/role/${roleId}`, {
      params: { moduleId },
    });
    const list = (data?.permisos ?? data?.items ?? data) as any[];
    return { total: Number(data?.total ?? list?.length ?? 0), permisos: (list ?? []).map(adaptPermiso) };
  }

  async togglePermisoOnUser(userId: number, permisoId: number, enable: boolean) {
    const { data } = await api.patch(`/permisos/toggle/user`, { userId, permisoId, enable });
    return data;
  }

  async togglePermisoOnRole(roleId: number, permisoId: number, enable: boolean) {
    const { data } = await api.patch(`/permisos/toggle/role`, { roleId, permisoId, enable });
    return data;
  }

  async assignPermisosToUser(userId: number, permisoIds: number[]) {
    const { data } = await api.patch(`/permisos/usuarios/assign`, { userId, permisoIds });
    return data;
  }

  /* ===== Módulos de permiso (opcional) ===== */
  async listPermisoModules(): Promise<Array<{ id: number; nombre: string }>> {
    const { data } = await api.get("/permiso-modules");
    return toArray(data).map((m: any) => ({
      id: m?.id_permiso_module_pk ?? m?.id ?? 0,
      nombre: m?.nombre ?? "",
    }));
  }

  /* ===== WS: eventos ===== */
  onPermisoChanged(cb: () => void) {
    const s = this.socketPermisos();
    s.on("permiso:changed", cb);
    return () => s.off("permiso:changed", cb);
  }
  onPermisoRoleChanged(cb: () => void) {
    const s = this.socketPermisos();
    s.on("permiso:role-changed", cb);
    return () => s.off("permiso:role-changed", cb);
  }
  onPermisoUserChanged(cb: () => void) {
    const s = this.socketPermisos();
    s.on("permiso:user-changed", cb);
    return () => s.off("permiso:user-changed", cb);
  }
  onRolEvents(cb: () => void) {
    const s = this.socketRoles();
    const evs = ["rol:created", "rol:updated", "rol:deleted", "rol:restored"];
    evs.forEach((ev) => s.on(ev, cb));
    return () => evs.forEach((ev) => s.off(ev, cb));
  }

  onPermissionsChanged(cb: (data: any) => void) {
    const s = this.socketPermisos();
    s.on("user:permissions-changed", cb);
    return () => {
      s.off("user:permissions-changed", cb);
    };
  }
}

export const permisoService = new PermisoService();

/* =========================
 * Exports estilo función
 * ========================= */
export const listRoles = () => permisoService.listRoles();
export const listRolesEliminados = () => permisoService.listRolesEliminados();
export const getRoleUserCounts = () => permisoService.getRoleUserCounts();
export const crearRol = (nombre: string) => permisoService.crearRol(nombre);
export const renombrarRol = (id: number, nombre: string) => permisoService.renombrarRol(id, nombre);
export const eliminarRol = (id: number) => permisoService.eliminarRol(id);
export const restaurarRol = (id: number) => permisoService.restaurarRol(id);

export const getPermisosForUserSelection = (userId: number, moduleId?: number) =>
  permisoService.getPermisosForUserSelection(userId, moduleId);
export const getPermisosForRoleSelection = (roleId: number, moduleId?: number) =>
  permisoService.getPermisosForRoleSelection(roleId, moduleId);

export const togglePermisoOnUser = (userId: number, permisoId: number, enable: boolean) =>
  permisoService.togglePermisoOnUser(userId, permisoId, enable);
export const togglePermisoOnRole = (roleId: number, permisoId: number, enable: boolean) =>
  permisoService.togglePermisoOnRole(roleId, permisoId, enable);

export const assignPermisosToUser = (userId: number, permisoIds: number[]) =>
  permisoService.assignPermisosToUser(userId, permisoIds);

export const listPermisoModules = () => permisoService.listPermisoModules();
