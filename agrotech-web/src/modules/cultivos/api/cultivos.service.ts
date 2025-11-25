import { api, connectSocket } from "@/shared/api/client";
import { adaptCultivo } from "../model/mappers";
import type { Cultivo, CreateCultivoInput, UpdateCultivoInput } from "../model/types";
import type { Socket } from "socket.io-client";

function mapCreateDtoToApi(dto: CreateCultivoInput) {
  const formData = new FormData();
  formData.append('nombre_cultivo', dto.nombre);
  if (dto.descripcion) formData.append('descripcion_cultivo', dto.descripcion);
  formData.append('id_tipo_cultivo_fk', dto.idTipoCultivo.toString());
  if (dto.idSublote) formData.append('id_sublote_fk', dto.idSublote.toString());
  if (dto.img) formData.append('imagen', dto.img);
  return formData;
}

function mapUpdateDtoToApi(dto: UpdateCultivoInput) {
  const formData = new FormData();
  if (dto.nombre !== undefined) formData.append('nombre_cultivo', dto.nombre);
  if (dto.descripcion !== undefined) formData.append('descripcion_cultivo', dto.descripcion);
  if (dto.idTipoCultivo !== undefined) formData.append('id_tipo_cultivo_fk', dto.idTipoCultivo.toString());
  if (dto.idSublote !== undefined) formData.append('id_sublote_fk', dto.idSublote.toString());
  if (dto.estado !== undefined) formData.append('estado_cultivo', dto.estado);
  if (dto.img) formData.append('imagen', dto.img);
  return formData;
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
    tipoCultivoId?: number;
    estado?: string;
  }): Promise<Cultivo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.loteId) query.loteId = params.loteId;
    if (params?.tipoCultivoId) query.tipoCultivoId = params.tipoCultivoId;
    if (params?.estado) query.estado = params.estado;

    const { data } = await api.get("/cultivos", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Cultivo> {
    const { data } = await api.get(`/cultivos/${id}`);
    return adaptCultivo(data);
  }

  async create(payload: CreateCultivoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    const { data } = await api.post("/cultivos", body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    this.emit("cultivos:created", data);
    const id = data?.id ?? data?.id_cultivo_pk ?? 0;
    return { message: data?.message ?? "Cultivo creado", id };
  }

  async update(id: number, payload: UpdateCultivoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/cultivos/${id}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    this.emit("cultivos:updated", data);
    return { message: data?.message ?? "Cultivo actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/cultivos/${id}`);
    this.emit("cultivos:deleted", { id_cultivo_pk: id });
    return true;
  }

  async finalizar(id: number): Promise<{ message: string }> {
    const { data } = await api.patch(`/cultivos/${id}/finalizar`);
    this.emit("cultivos:updated", data);
    return { message: data?.message ?? "Cultivo finalizado" };
  }

  async restore(id: number): Promise<Cultivo> {
    const { data } = await api.patch(`/cultivos/restore/${id}`);
    this.emit("cultivos:restored", data);
    return adaptCultivo(data);
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
  onDeleted(cb: (data: any) => void) {
    this.on("cultivos:deleted", cb);
  }
  onRestored(cb: (cultivo: any) => void) {
    this.on("cultivos:restored", cb);
  }

  offCreated(cb?: (cultivo: any) => void) {
    this.off("cultivos:created", cb);
  }
  offUpdated(cb?: (cultivo: any) => void) {
    this.off("cultivos:updated", cb);
  }
  offDeleted(cb?: (data: any) => void) {
    this.off("cultivos:deleted", cb);
  }
  offRestored(cb?: (cultivo: any) => void) {
    this.off("cultivos:restored", cb);
  }
}

export const cultivosService = new CultivosService();

export const listCultivos = (params?: { page?: number; limit?: number; q?: string; loteId?: number; tipoCultivoId?: number; estado?: string }) =>
  cultivosService.list(params);
export const getCultivo = (id: number) => cultivosService.get(id);
export const createCultivo = (payload: CreateCultivoInput) => cultivosService.create(payload);
export const updateCultivo = (id: number, payload: UpdateCultivoInput) => cultivosService.update(id, payload);
export const removeCultivo = (id: number) => cultivosService.remove(id);
export const finalizarCultivo = (id: number) => cultivosService.finalizar(id);
export const restoreCultivo = (id: number) => cultivosService.restore(id);