import type { Sublote, CreateSubloteDTO } from "../model/types";
import { mapSubloteFromApi, mapSubloteToApi } from "../model/mappers";
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

class SubloteService {
  private socket: Socket | null = null;

  // CRUD REST con emisión de eventos
  async listSublotes(): Promise<Sublote[]> {
    const { data } = await api.get("/geo/sublotes");
    return Array.isArray(data) ? data.map(mapSubloteFromApi) : [];
  }

  async getSubloteById(id: number): Promise<Sublote> {
    const { data } = await api.get(`/geo/sublotes/${id}`);
    return mapSubloteFromApi(data);
  }

  async createSublote(payload: CreateSubloteDTO): Promise<Sublote> {
    const { data } = await api.post("/geo/sublotes", mapSubloteToApi(payload));
    const sublote = mapSubloteFromApi(data);
    // Emitir evento WebSocket para todos los clientes conectados
    this.emit("sublotes:created", sublote);
    return sublote;
  }

  async updateSublote(id: number, payload: CreateSubloteDTO): Promise<Sublote> {
    const { data } = await api.patch(`/geo/sublotes/${id}`, mapSubloteToApi(payload));
    const sublote = mapSubloteFromApi(data);
    // Emitir evento WebSocket
    this.emit("sublotes:updated", sublote);
    return sublote;
  }

  async removeSublote(id: number): Promise<boolean> {
    await api.delete(`/geo/sublotes/${id}`);
    // Emitir evento WebSocket indicando eliminación
    this.emit("sublotes:removed", { id_sublote_pk: id });
    return true;
  }

  async restoreSublote(id: number): Promise<Sublote> {
    const { data } = await api.patch(`/geo/sublotes/restore/${id}`);
    const sublote = mapSubloteFromApi(data);
    this.emit("sublotes:restored", sublote);
    return sublote;
  }

  // WebSocket
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
}

export const subloteService = new SubloteService();
