import { api, connectSocket } from "@/shared/api/client";
import { adaptLote, adaptSublote } from "../model/mappers";
import type { Lote, Sublote, CreateLoteDTO, UpdateLoteDTO, CreateSubloteDTO, UpdateSubloteDTO } from "../model/types";
import type { Socket } from "socket.io-client";

function normalizeListResp(data: any): Lote[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.lotes) && data.lotes) ||
    [];
  return (raw as any[]).map(adaptLote);
}

function normalizeSublotesResp(data: any): Sublote[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.sublotes) && data.sublotes) ||
    [];
  return (raw as any[]).map(adaptSublote);
}

class LotesService {
  private socket: Socket | null = null;

  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Lote[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;

    const { data } = await api.get("/geo/lotes", { params: query });
    return normalizeListResp(data);
  }

  async getLoteById(id: number): Promise<Lote> {
    const { data } = await api.get(`/geo/lotes/${id}`);
    return adaptLote(data);
  }

  async createLote(payload: Partial<CreateLoteDTO>): Promise<Lote> {
    // We allow payload to be partial or match DTO, but ultimately it depends on backend validation
    const { data } = await api.post("/geo/lotes", payload);
    this.emit("lotes:created", data);
    return adaptLote(data);
  }

  async updateLote(id: number, payload: Partial<UpdateLoteDTO>): Promise<Lote> {
    const { data } = await api.patch(`/geo/lotes/${id}`, payload);
    this.emit("lotes:updated", data);
    return adaptLote(data);
  }

  async removeLote(id: number): Promise<void> {
    await api.delete(`/geo/lotes/${id}`);
    this.emit("lotes:removed", { id_lote_pk: id });
  }

  async restoreLote(id: number): Promise<Lote> {
    const { data } = await api.patch(`/geo/lotes/restore/${id}`);
    this.emit("lotes:restored", data);
    return adaptLote(data);
  }

  async getSublotes(loteId: number, params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Sublote[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;

    const { data } = await api.get(`/geo/sublotes`, { params: { ...query, loteId } });
    return normalizeSublotesResp(data);
  }

  async createSublote(payload: Partial<CreateSubloteDTO>): Promise<Sublote> {
    const { data } = await api.post("/geo/sublotes", payload);
    this.emit("sublotes:created", data);
    return adaptSublote(data);
  }

  async updateSublote(id: number, payload: Partial<UpdateSubloteDTO>): Promise<Sublote> {
    const { data } = await api.patch(`/geo/sublotes/${id}`, payload);
    this.emit("sublotes:updated", data);
    return adaptSublote(data);
  }

  async removeSublote(id: number): Promise<void> {
    await api.delete(`/geo/sublotes/${id}`);
    this.emit("sublotes:removed", { id_sublote_pk: id });
  }

  // === WEBSOCKET ===

  connect(): Socket {
    if (!this.socket || this.socket.disconnected) {
      this.socket = connectSocket("/geo");
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
  onCreated(cb: (lote: any) => void) {
    this.on("lotes:created", cb);
  }
  onUpdated(cb: (lote: any) => void) {
    this.on("lotes:updated", cb);
  }
  onDeleted(cb: (data: any) => void) {
    this.on("lotes:removed", cb);
  }
  onRestored(cb: (lote: any) => void) {
    this.on("lotes:restored", cb);
  }

  offCreated(cb?: (lote: any) => void) {
    this.off("lotes:created", cb);
  }
  offUpdated(cb?: (lote: any) => void) {
    this.off("lotes:updated", cb);
  }
  offDeleted(cb?: (data: any) => void) {
    this.off("lotes:removed", cb);
  }
  offRestored(cb?: (lote: any) => void) {
    this.off("lotes:restored", cb);
  }
}

export const lotesService = new LotesService();

export const listLotes = (params?: { page?: number; limit?: number; q?: string }) =>
  lotesService.list(params);
export const getSublotes = (loteId: number, params?: { page?: number; limit?: number; q?: string }) =>
  lotesService.getSublotes(loteId, params);
