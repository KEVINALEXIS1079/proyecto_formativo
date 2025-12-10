import { api, connectSocket } from "@/shared/api/client";
import { adaptCultivo } from "../model/mappers";
import type { Cultivo, CreateCultivoInput, UpdateCultivoInput, CultivoHistorial } from "../model/types";
import type { Socket } from "socket.io-client";

function mapCreateDtoToApi(dto: CreateCultivoInput) {
  const hasSub = dto.idSublote !== undefined && dto.idSublote !== null;
  return {
    nombreCultivo: dto.nombre,
    tipoCultivo: dto.tipoCultivo,
    descripcion: dto.descripcion,
    loteId: hasSub ? undefined : dto.idLote !== undefined ? Number(dto.idLote) : undefined,
    subLoteId: hasSub ? Number(dto.idSublote) : undefined,
    estado: dto.estado,
  };
}

function mapUpdateDtoToApi(dto: UpdateCultivoInput) {
  const body: any = {};
  if (dto.nombre !== undefined) body.nombreCultivo = dto.nombre;
  if (dto.tipoCultivo !== undefined) body.tipoCultivo = dto.tipoCultivo;
  if (dto.descripcion !== undefined) body.descripcion = dto.descripcion;
  if (dto.idSublote !== undefined) {
    body.subLoteId = dto.idSublote === null ? null : Number(dto.idSublote); // puede ser null para limpiar
    if (dto.idSublote !== null) body.loteId = undefined;
  }
  if (dto.idLote !== undefined) body.loteId = dto.idLote === null ? null : Number(dto.idLote);
  if (dto.estado !== undefined) body.estado = dto.estado;
  if (dto.motivo !== undefined) body.motivo = dto.motivo;
  if ((dto as any).img !== undefined) body.img = (dto as any).img;
  return body;
}

function normalizeListResp(data: any): Cultivo[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.cultivos) && data.cultivos) ||
    [];
  return (raw as any[]).map(adaptCultivo);
}

class CultivosService {
  private socket: Socket | null = null;
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    loteId?: number;
    tipoCultivo?: string;
    estado?: string;
  }): Promise<Cultivo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.loteId) query.loteId = params.loteId;
    if (params?.tipoCultivo) query.tipoCultivo = params.tipoCultivo;
    if (params?.estado) query.estado = params.estado;

    const { data } = await api.get("/cultivos", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Cultivo> {
    const { data } = await api.get(`/cultivos/${id}`);
    return adaptCultivo(data);
  }

  async listHistorial(params?: { limit?: number; cultivoId?: number }): Promise<CultivoHistorial[]> {
    const paramsObj: Record<string, any> = {};
    if (params?.limit) paramsObj.limit = params.limit;
    if (params?.cultivoId) paramsObj.cultivoId = params.cultivoId;
    const { data } = await api.get("/cultivos/historial", { params: Object.keys(paramsObj).length ? paramsObj : undefined });
    return Array.isArray(data) ? data : data?.items || [];
  }

  async create(payload: CreateCultivoInput): Promise<{ message: string; id: number }> {
    const hasFile = payload.img instanceof File;
    const body = mapCreateDtoToApi(payload);
    const reqBody = hasFile ? new FormData() : body;
    if (hasFile && reqBody instanceof FormData) {
      Object.entries(body).forEach(([k, v]) => {
        if (v !== undefined && v !== null) reqBody.append(k, String(v));
      });
      reqBody.append("img", payload.img as File);
    }
    const { data } = await api.post("/cultivos", reqBody, {
      headers: hasFile ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    this.emit("cultivos:created", data);
    const id = data?.id ?? data?.id_cultivo_pk ?? 0;
    return { message: data?.message ?? "Cultivo creado", id };
  }

  async update(id: number, payload: UpdateCultivoInput): Promise<{ message: string }> {
    const hasFile = (payload as any).img instanceof File;
    const body = mapUpdateDtoToApi(payload);
    const reqBody = hasFile ? new FormData() : body;
    if (hasFile && reqBody instanceof FormData) {
      Object.entries(body).forEach(([k, v]) => {
        if (v === undefined) return;
        // Enviar null como string vacía para que el backend pueda interpretarlo como null
        reqBody.append(k, v === null ? "" : String(v));
      });
      reqBody.append("img", (payload as any).img as File);
    }
    const { data } = await api.patch(`/cultivos/${id}`, reqBody, {
      headers: hasFile ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    this.emit("cultivos:updated", data);
    return { message: data?.message ?? "Cultivo actualizado" };
  }

  // === WEBSOCKET ===

  connect(): Socket {
    if (!this.socket || this.socket.disconnected) {
      this.socket = connectSocket("/cultivos");
    }
    return this.socket;
  }

  on(event: string, callback: (...args: any[]) => void) {
    const socket = this.connect();
    socket.off(event);
    socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) this.socket.off(event, callback);
    else this.socket.removeAllListeners(event);
  }

  emit(event: string, payload?: any) {
    const socket = this.connect();
    if (socket.connected) {
      socket.emit(event, payload);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Atajos semánticos para listeners
  onCreated(cb: (cultivo: any) => void) {
    this.on("cultivos:created", cb);
  }
  onUpdated(cb: (cultivo: any) => void) {
    this.on("cultivos:updated", cb);
  }
  offCreated(cb?: (cultivo: any) => void) {
    this.off("cultivos:created", cb);
  }
  offUpdated(cb?: (cultivo: any) => void) {
    this.off("cultivos:updated", cb);
  }
}

export const cultivosService = new CultivosService();

export const listCultivos = (params?: { page?: number; limit?: number; q?: string; loteId?: number; tipoCultivoId?: number; estado?: string }) =>
  cultivosService.list(params);
export const getCultivo = (id: number) => cultivosService.get(id);
export const createCultivo = (payload: CreateCultivoInput) => cultivosService.create(payload);
export const updateCultivo = (id: number, payload: UpdateCultivoInput) => cultivosService.update(id, payload);
export const listHistorial = (params?: { limit?: number }) => cultivosService.listHistorial(params);
