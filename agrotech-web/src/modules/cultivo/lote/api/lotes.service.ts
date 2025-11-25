import type { Lote, CreateLoteDTO } from "../model/types";
import { mapLoteFromApi, mapLoteToApi } from "../model/mappers";
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

class LoteService {
  private socket: Socket | null = null;

  // CRUD REST
  async listLotes(): Promise<Lote[]> {
    const { data } = await api.get("/lotes");
    return Array.isArray(data) ? data.map(mapLoteFromApi) : [];
  }

  async getLoteById(id: number): Promise<Lote> {
    const { data } = await api.get(`/lotes/${id}`);
    return mapLoteFromApi(data);
  }

  async createLote(payload: CreateLoteDTO): Promise<Lote> {
    const { data } = await api.post("/lotes", mapLoteToApi(payload));
    return mapLoteFromApi(data);
  }

  async updateLote(id: number, payload: CreateLoteDTO): Promise<Lote> {
    const { data } = await api.patch(`/lotes/${id}`, mapLoteToApi(payload));
    return mapLoteFromApi(data);
  }

  async removeLote(id: number): Promise<boolean> {
    await api.delete(`/lotes/${id}`);
    return true;
  }

  // WebSocket
  connect(): Socket {
    if (!this.socket || this.socket.disconnected) {
      this.socket = connectSocket("/lotes");
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

export const loteService = new LoteService();
