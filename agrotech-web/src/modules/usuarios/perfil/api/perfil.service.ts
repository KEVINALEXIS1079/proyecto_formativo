// src/modules/usuarios/perfil/api/perfilService.ts
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";
import type { EstadoUsuario, Perfil, UpdatePerfilInput } from "../model/types";

/* =========================
 * Helpers
 * ========================= */
const isFile = (v: unknown): v is File =>
  typeof File !== "undefined" && v instanceof File;

/** Base del backend:
 *  1) usa api.defaults.baseURL si está configurado en tu cliente
 *  2) si no, fallback fijo (ajústalo a tu entorno)
 */
const API_BASE: string =
  (api as any)?.defaults?.baseURL?.replace(/\/+$/, "") || "http://localhost:4000";

/** Convierte rutas del FS (ej. "uploads\...") o relativas ("/uploads/...") a URL absoluta. */
function toPublicUrl(pathLike?: string | null): string | null {
  if (!pathLike) return null;

  const asString = String(pathLike);

  // 1) ya es absoluta -> no tocar
  if (/^https?:\/\//i.test(asString)) return asString;

  // 2) normaliza separadores y "./"
  const clean = asString.replace(/\\/g, "/").replace(/^\.\//, "");

  // 3) asegura que empiece con "/" para poder resolver bien con URL()
  const rel = clean.startsWith("/") ? clean : `/${clean}`;

  // 4) resuelve absoluta contra la base del backend
  try {
    return new URL(rel, `${API_BASE}/`).href.replace(/\/+$/, "");
  } catch {
    // fallback defensivo por si URL() falla con strings raros
    return `${API_BASE}${rel}`;
  }
}

/* =========================
 * Mapper
 * ========================= */
function adaptPerfil(x: any): Perfil {
  const eliminado = x?.delete_at != null || x?.deleted_at != null;
  return {
    id: x?.id_usuario_pk ?? x?.id ?? 0,
    cedula: x?.cedula_usuario ?? "",
    nombre: x?.nombre_usuario ?? "",
    apellido: x?.apellido_usuario ?? "",
    telefono: x?.telefono_usuario ?? "",
    correo: x?.correo_usuario ?? x?.correo ?? "",
    idFicha: x?.id_ficha ?? "",
    avatar: toPublicUrl(x?.img_usuario ?? x?.avatar ?? null),
    rol: x?.rol
      ? { id: x.rol.id_rol_pk ?? x.rol.id ?? 0, nombre: x.rol.nombre_rol ?? x.rol.nombre ?? "" }
      : null,
    estado: (eliminado ? "eliminado" : (x?.estado_usuario ?? x?.estado ?? "activo")) as EstadoUsuario,
  };
}

/* =========================
 * Serializadores
 * ========================= */
function dtoToFormData(dto: UpdatePerfilInput): FormData {
  const fd = new FormData();
  if (dto.nombre !== undefined)   fd.append("nombre_usuario", dto.nombre);
  if (dto.apellido !== undefined) fd.append("apellido_usuario", dto.apellido);
  if (dto.telefono !== undefined) fd.append("telefono_usuario", dto.telefono);
  if (dto.correo !== undefined)   fd.append("correo_usuario", dto.correo);
  if (dto.idFicha !== undefined)  fd.append("id_ficha", dto.idFicha);
  if (dto.estado !== undefined)   fd.append("estado_usuario", dto.estado);
  if (dto.avatar && isFile(dto.avatar)) fd.append("img_usuario", dto.avatar);
  return fd;
}

function dtoToJson(dto: UpdatePerfilInput) {
  const out: any = {};
  if (dto.nombre !== undefined)   out.nombre_usuario = dto.nombre;
  if (dto.apellido !== undefined) out.apellido_usuario = dto.apellido;
  if (dto.telefono !== undefined) out.telefono_usuario = dto.telefono;
  if (dto.correo !== undefined)   out.correo_usuario = dto.correo;
  if (dto.idFicha !== undefined)  out.id_ficha = dto.idFicha;
  if (dto.estado !== undefined)   out.estado_usuario = dto.estado;
  if (dto.avatar && !isFile(dto.avatar)) out.img_usuario = dto.avatar; // URL (se respeta tal cual)
  return out;
}

/* =========================
 * Service
 * ========================= */
class PerfilService {
  private socket: Socket | null = null;
  private currentId: number | null = null; // cache del id del usuario autenticado

  /** GET /auth/profile */
  async me(): Promise<Perfil> {
    const { data } = await api.get("/auth/profile");
    const perfil = adaptPerfil(data);
    this.currentId = perfil.id;
    return perfil;
  }

  /** Asegura el id del usuario autenticado */
  private async ensureMyId(): Promise<number> {
    if (this.currentId) return this.currentId;
    const me = await this.me();
    return me.id;
  }

  /**
   * PATCH /usuarios/:id
   * - Si payload.avatar es File => multipart/form-data
   * - Si es string (URL) o no viene => JSON
   */
  async updateMe(payload: UpdatePerfilInput): Promise<{ message: string; me: Perfil }> {
    const id = await this.ensureMyId();
    const hasFile = isFile(payload.avatar);

    if (hasFile) {
      const fd = dtoToFormData(payload);
      const { data } = await api.patch(`/usuarios/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { message: data?.message ?? "Perfil actualizado", me: adaptPerfil(data?.usuario ?? data) };
    } else {
      const body = dtoToJson(payload);
      const { data } = await api.patch(`/usuarios/${id}`, body);
      return { message: data?.message ?? "Perfil actualizado", me: adaptPerfil(data?.usuario ?? data) };
    }
  }

  /* ===== WebSocket ===== */
  namespace() {
    // Debe coincidir con tu @WebSocketGateway({ namespace: '/usuarios' })
    return (import.meta.env.VITE_USERS_WS_NS as string) || "/usuarios";
  }

  connect(): Socket {
    if (this.socket && this.socket.connected) return this.socket;
    this.socket = connectSocket(this.namespace());
    return this.socket;
  }

  onProfileChanged(cb: (...args: any[]) => void) {
    this.connect().on("usuarios:perfil_actualizado", cb);
  }

  offProfileChanged(cb?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (cb) this.socket.off("usuarios:perfil_actualizado", cb);
    else this.socket.removeAllListeners("usuarios:perfil_actualizado");
  }
}

export const perfilService = new PerfilService();

/* Exports convenientes */
export const getPerfil  = () => perfilService.me();
export const savePerfil = (dto: UpdatePerfilInput) => perfilService.updateMe(dto);
