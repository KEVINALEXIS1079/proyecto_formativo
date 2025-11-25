// src/modules/usuarios/usuarios/api/usuario.service.ts
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

/* =========================
 * Tipos del dominio
 * ========================= */
export type EstadoUsuario = "activo" | "inactivo" | "eliminado";
export type RolLite = { id: number; nombre: string };
export type UsuarioLite = {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  avatar?: string;
  rol: RolLite;
  estado: EstadoUsuario;
};

/* =========================
 * Helpers de mapeo
 * ========================= */
function adaptUsuarioLite(x: any): UsuarioLite {
  const eliminado = x?.delete_at != null || x?.deleted_at != null;
  return {
    id: x?.id_usuario_pk ?? x?.id ?? 0,
    cedula: x?.cedula_usuario ?? x?.cedula ?? "",
    nombre: x?.nombre_usuario ?? x?.nombre ?? "",
    apellido: x?.apellido_usuario ?? x?.apellido ?? "",
    telefono: x?.telefono_usuario ?? x?.telefono ?? "",
    correo: x?.correo_usuario ?? x?.correo ?? x?.email ?? "",
    idFicha: x?.id_ficha ?? x?.idFicha ?? "",
    avatar: x?.img_usuario ?? x?.avatar ?? undefined,
    rol: {
      id: x?.rol?.id_rol_pk ?? x?.rol?.id ?? x?.id_rol_fk ?? 0,
      nombre: x?.rol?.nombre_rol ?? x?.rol?.nombre ?? "",
    },
    estado: eliminado
      ? "eliminado"
      : ((x?.estado_usuario ?? x?.estado ?? "activo") as EstadoUsuario),
  };
}

function mapDtoToApi(
  dto: Partial<UsuarioLite> & { idRol?: number; contrasena?: string }
) {
  const out: Record<string, any> = {};
  if (dto.cedula !== undefined) out.cedula_usuario = dto.cedula;
  if (dto.nombre !== undefined) out.nombre_usuario = dto.nombre;
  if (dto.apellido !== undefined) out.apellido_usuario = dto.apellido;
  if (dto.telefono !== undefined) out.telefono_usuario = dto.telefono;
  if (dto.correo !== undefined) out.correo_usuario = dto.correo;
  if (dto.idFicha !== undefined) out.id_ficha = dto.idFicha;
  if (dto.avatar !== undefined) out.img_usuario = dto.avatar;
  if (dto.idRol !== undefined) out.id_rol_fk = dto.idRol;
  if (dto.estado !== undefined) out.estado_usuario = dto.estado;
  if ((dto as any).contrasena !== undefined)
    out.contrasena_usuario = (dto as any).contrasena; // ajusta si tu backend usa otro nombre
  return out;
}

function normalizeListResp(data: any): UsuarioLite[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.usuarios) && data.usuarios) ||
    [];
  return (raw as any[]).map(adaptUsuarioLite);
}

/* =========================
 * Service
 * ========================= */
class UsuarioService {
  private socket: Socket | null = null;

  /* ===== REST ===== */
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    estado?: "activo" | "inactivo" | "eliminado" | "todos";
    rolId?: number;
  }): Promise<UsuarioLite[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) {
      query.q = params.q;
      query.search = params.q;
    }
    if (params?.estado && params.estado !== "todos")
      query.estado_usuario = params.estado;
    if (params?.rolId) query.id_rol_fk = params.rolId;

    const { data } = await api.get("/usuarios", { params: query });
    return normalizeListResp(data);
  }

  async listDeleted(): Promise<UsuarioLite[]> {
    try {
      const { data } = await api.get("/usuarios/deleted");
      return normalizeListResp(data);
    } catch {
      // fallback si no existe endpoint dedicado
      return this.list({ estado: "eliminado" });
    }
  }

  async get(id: number): Promise<UsuarioLite> {
    const { data } = await api.get(`/usuarios/${id}`);
    return adaptUsuarioLite(data);
  }

  async create(payload: {
    cedula: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    idFicha: string;
    avatar?: string;
    idRol: number;
    contrasena?: string;
  }): Promise<{ message: string; id: number }> {
    const body = mapDtoToApi(payload);
    const { data } = await api.post("/usuarios", body);
    const id =
      data?.id ??
      data?.id_usuario_pk ??
      data?.usuario?.id ??
      data?.usuario?.id_usuario_pk ??
      0;
    return { message: data?.message ?? "Usuario creado", id };
  }

  async update(
    id: number,
    payload: Partial<
      Omit<Parameters<UsuarioService["create"]>[0], "contrasena">
    >
  ): Promise<{ message: string }> {
    const body = mapDtoToApi(payload as any);
    const { data } = await api.patch(`/usuarios/${id}`, body);
    return { message: data?.message ?? "Usuario actualizado" };
  }

  async updateEstado(id: number, estado: "activo" | "inactivo") {
    const { data } = await api.patch(`/usuarios/${id}`, {
      estado_usuario: estado,
    });
    const next = (data?.estado_usuario ?? data?.estado ?? estado) as EstadoUsuario;
    return { message: data?.message ?? "Estado actualizado", estado: next };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/usuarios/${id}`);
    return true;
  }

  async restore(id: number): Promise<boolean> {
    await api.patch(`/usuarios/restore/${id}`, {});
    return true;
  }

  async listRolesLite(): Promise<RolLite[]> {
    const { data } = await api.get("/roles");
    const raw: any[] =
      (Array.isArray(data) && data) ||
      (Array.isArray(data?.items) && data.items) ||
      (Array.isArray(data?.data) && data.data) ||
      [];
    return raw.map((r) => ({
      id: r?.id_rol_pk ?? r?.id ?? 0,
      nombre: r?.nombre_rol ?? r?.nombre ?? "",
    }));
  }

  async resetPassword(id: number, nuevaContrasena: string) {
    // Ajusta el nombre del campo si tu backend usa otro
    const { data } = await api.patch(`/usuarios/${id}/password`, {
      contrasena_usuario: nuevaContrasena,
    });
    return data as { message: string };
  }

  /* ===== Sockets ===== */
  private namespace(): string {
    return (import.meta.env?.VITE_USERS_WS_NS as string) || "/usuarios";
  }

  connect(): Socket {
    if (this.socket && this.socket.connected) return this.socket;
    this.socket = connectSocket(this.namespace());
    return this.socket;
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.connect().on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) this.socket.off(event, callback);
    else this.socket.removeAllListeners(event);
  }

  disconnect(): void {
    if (!this.socket) return;
    try {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    } catch {}
    this.socket = null;
  }

  // Atajos semánticos
  onListChanged(cb: () => void) {
    this.on("usuarios:lista_actualizada", cb);
  }
  offListChanged(cb?: () => void) {
    this.off("usuarios:lista_actualizada", cb);
  }

  onProfileChanged(cb: () => void) {
    this.on("usuarios:perfil_actualizado", cb);
  }
  offProfileChanged(cb?: () => void) {
    this.off("usuarios:perfil_actualizado", cb);
  }

  onCreated(cb: (u: any) => void) {
    this.on("usuarioCreated", cb);
  }
  onUpdated(cb: (u: any) => void) {
    this.on("usuarioUpdated", cb);
  }
  onDeleted(cb: (u: any) => void) {
    this.on("usuarioDeleted", cb);
  }
  offCreated(cb?: (u: any) => void) {
    this.off("usuarioCreated", cb);
  }
  offUpdated(cb?: (u: any) => void) {
    this.off("usuarioUpdated", cb);
  }
  offDeleted(cb?: (u: any) => void) {
    this.off("usuarioDeleted", cb);
  }
}

export const usuarioService = new UsuarioService();

/* =========================
 * Exports de función (para hooks)
 * ========================= */
export const listUsuarios = (params?: {
  page?: number;
  limit?: number;
  q?: string;
  estado?: "activo" | "inactivo" | "eliminado" | "todos";
  rolId?: number;
}) => usuarioService.list(params);

export const listRolesLite = () => usuarioService.listRolesLite();
export const softDeleteUsuario = (id: number) => usuarioService.remove(id);
export const updateEstado = (id: number, to: "activo" | "inactivo") =>
  usuarioService.updateEstado(id, to);
export const updateUsuario = (
  id: number,
  dto: Partial<UsuarioLite> & { idRol?: number }
) => usuarioService.update(id, dto);
export const restoreUsuario = (id: number) => usuarioService.restore(id);
