// src/modules/usuarios/shared/usuarios.service.ts
import api, { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

/* ========= Tipos ========= */
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

type Transport = "rest" | "ws";
let TRANSPORT: Transport = (import.meta.env.VITE_USERS_TRANSPORT as Transport) || "rest";
export function setUsuariosTransport(mode: Transport) {
  TRANSPORT = mode;
}

/* ========= Helpers WS (ACK) ========= */
function emitAck<TReq, TRes>(socket: Socket, event: string, payload: TReq, ms = 8000) {
  return new Promise<TRes>((resolve, reject) => {
    // socket.timeout hace que el primer arg del callback sea error si hay timeout
    socket.timeout(ms).emit(event, payload, (err: any, res: any) => {
      if (err) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || err?.error || "WS error sin detalle";
        return reject(new Error(msg));
      }
      resolve(res as TRes);
    });
  });
}

/* ========= Adaptador y mapeos ========= */
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
    estado: eliminado ? "eliminado" : ((x?.estado_usuario ?? x?.estado ?? "activo") as EstadoUsuario),
  };
}

function mapDtoToSnake(dto: any) {
  const out: any = {};
  if (dto.cedula !== undefined) out.cedula_usuario = dto.cedula;
  if (dto.nombre !== undefined) out.nombre_usuario = dto.nombre;
  if (dto.apellido !== undefined) out.apellido_usuario = dto.apellido;
  if (dto.telefono !== undefined) out.telefono_usuario = dto.telefono;
  if (dto.correo !== undefined) out.correo_usuario = dto.correo;
  if (dto.idFicha !== undefined) out.id_ficha = dto.idFicha;
  if (dto.avatar !== undefined) out.img_usuario = dto.avatar;
  if (dto.idRol !== undefined) out.id_rol_fk = dto.idRol;
  if (dto.estado !== undefined) out.estado_usuario = dto.estado;
  return out;
}

function normalizeListResp(data: any, page: number, limit: number) {
  const raw: any[] =
    (Array.isArray(data) && data) || data?.items || data?.data || data?.usuarios || [];
  const items = raw.map(adaptUsuarioLite);
  return {
    items,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    total: data?.total ?? items.length,
    hasMore:
      data?.hasMore ??
      (data?.total
        ? data.total > (data?.page ?? page) * (data?.limit ?? limit)
        : items.length === limit),
    nextOffset: data?.nextOffset ?? (data?.page ?? page) * (data?.limit ?? limit),
  };
}

/* ========= Namespace / eventos WS =========
   Ajusta si tu gateway usa otros nombres:
   - namespace: "/api/v1/usuarios"
   - eventos: "find_all", "find_one", "create", "update", "remove"
*/
const WS_NAMESPACE = "/api/v1/usuarios";

/* =============== API =============== */
export async function listUsuarios(params: {
  page?: number;
  limit?: number;
  q?: string;
  estado?: "activo" | "inactivo" | "eliminado" | "todos";
  rolId?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  if (TRANSPORT === "rest") {
    const query: Record<string, any> = { page, limit };
    if (params.q) {
      query.q = params.q;
      query.search = params.q;
    }
    if (params.estado && params.estado !== "todos") query.estado_usuario = params.estado;
    if (params.rolId) query.id_rol_fk = params.rolId;

    const { data } = await api.get("/usuarios", { params: query });
    return normalizeListResp(data, page, limit);
  }

  // === WS ===
  const socket = connectSocket(WS_NAMESPACE);
  // Si tu servidor soporta filtros via WS, pásalos; si no, trae todo y pagina client-side
  const res = await emitAck<any, { ok?: boolean; data?: any[]; error?: string }>(
    socket,
    "find_all",
    { page, limit, q: params.q, estado: params.estado, rolId: params.rolId }
  ).catch(async () => {
    // fallback: pedir sin filtros y paginar aquí (por compatibilidad)
    const allRes = await emitAck<undefined, { ok?: boolean; data?: any[] }>(
      socket,
      "find_all",
      undefined as any
    );
    const all = (allRes?.data ?? []).map(adaptUsuarioLite) as UsuarioLite[];
    const start = (page - 1) * limit;
    return {
      ok: true,
      data: all.slice(start, start + limit),
      page,
      limit,
      total: all.length,
    } as any;
  });

  if (res && "error" in res && res.error) throw new Error(res.error);

  // Si el gateway devuelve items/paginación, normalizamos; si no, asumimos array simple
  const data = (res as any)?.data ?? res;
  if (Array.isArray(data)) {
    const items = data.map(adaptUsuarioLite);
    return {
      items,
      page,
      limit,
      total: items.length,
      hasMore: items.length === limit,
      nextOffset: page * limit,
    };
  }
  return normalizeListResp(data, page, limit);
}

export async function getUsuario(id: number) {
  if (TRANSPORT === "rest") {
    const { data } = await api.get(`/usuarios/${id}`);
    return adaptUsuarioLite(data);
  }
  const socket = connectSocket(WS_NAMESPACE);
  const res = await emitAck<{ id: number }, { ok?: boolean; data?: any; error?: string }>(
    socket,
    "find_one",
    { id }
  );
  if (res?.error) throw new Error(res.error);
  return adaptUsuarioLite((res as any).data ?? res);
}

export async function createUsuario(payload: {
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  avatar?: string;
  idRol: number;
  contrasena?: string;
}) {
  if (TRANSPORT === "rest") {
    const body = mapDtoToSnake(payload);
    if (payload.contrasena) body.contrasena_usuario = payload.contrasena;
    const { data } = await api.post("/usuarios", body);
    return data as { message: string; id: number };
  }
  const socket = connectSocket(WS_NAMESPACE);
  const dto = mapDtoToSnake(payload);
  if (payload.contrasena) dto.contrasena_usuario = payload.contrasena;

  const res = await emitAck<any, { ok?: boolean; message?: string; data?: any; error?: string }>(
    socket,
    "create",
    { dto }
  );
  if (res?.error) throw new Error(res.error);
  return { message: res?.message ?? "Usuario creado", id: (res as any)?.data?.id };
}

export async function updateUsuario(
  id: number,
  payload: Partial<Omit<Parameters<typeof createUsuario>[0], "contrasena">>
) {
  if (TRANSPORT === "rest") {
    const body = mapDtoToSnake(payload);
    const { data } = await api.patch(`/usuarios/${id}`, body);
    return data as { message: string };
  }
  const socket = connectSocket(WS_NAMESPACE);
  const res = await emitAck<any, { ok?: boolean; message?: string; error?: string }>(
    socket,
    "update",
    { id, dto: mapDtoToSnake(payload) }
  );
  if (res?.error) throw new Error(res.error);
  return { message: res?.message ?? "Usuario actualizado" };
}

export async function updateEstado(id: number, estado: "activo" | "inactivo") {
  if (TRANSPORT === "rest") {
    const { data } = await api.patch(`/usuarios/${id}`, { estado_usuario: estado });
    return data as { message: string; estado: EstadoUsuario };
  }
  const socket = connectSocket(WS_NAMESPACE);
  const res = await emitAck<any, { ok?: boolean; message?: string; error?: string }>(
    socket,
    "update",
    { id, dto: { estado_usuario: estado } }
  );
  if (res?.error) throw new Error(res.error);
  return { message: res?.message ?? "Estado actualizado", estado };
}

export async function softDeleteUsuario(id: number) {
  if (TRANSPORT === "rest") {
    const { data } = await api.delete(`/usuarios/${id}`);
    return { message: data?.message ?? "Usuario eliminado", estado: "eliminado" as const };
  }
  const socket = connectSocket(WS_NAMESPACE);
  const res = await emitAck<any, { ok?: boolean; message?: string; error?: string }>(
    socket,
    "remove",
    { id }
  );
  if (res?.error) throw new Error(res.error);
  return { message: res?.message ?? "Usuario eliminado", estado: "eliminado" as const };
}

export async function restoreUsuario(id: number) {
  const { data } = await api.patch(`/usuarios/restore/${id}`, {});
  return { message: data?.message ?? "Usuario restaurado", estado: "activo" as const };
}

export async function listRolesLite() {
  const { data } = await api.get("/roles");
  const raw: any[] = (Array.isArray(data) && data) || data?.items || data?.data || [];
  const items: RolLite[] = raw.map((r) => ({
    id: r?.id_rol_pk ?? r?.id ?? 0,
    nombre: r?.nombre_rol ?? r?.nombre ?? "",
  }));
  return { items };
}

export async function resetPassword(id: number, nuevaContrasena: string) {
  const { data } = await api.patch(`/usuarios/${id}/password`, { nuevaContrasena });
  return data as { message: string };
}
