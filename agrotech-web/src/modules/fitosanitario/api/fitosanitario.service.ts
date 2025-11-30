import type { Epa, CreateEpaInput, UpdateEpaInput } from "../models/types";
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

class FitosanitarioService {
  private socket: Socket | null = null;

  // === EPAS ===

  async listEpas(query?: any): Promise<Epa[]> {
    const { data } = await api.get("/epas", { params: query });
    return data?.data || [];
  }

  async getEpaById(id: number): Promise<Epa> {
    const { data } = await api.get(`/epas/${id}`);
    return data;
  }

  async createEpa(payload: CreateEpaInput): Promise<Epa> {
    const formData = new FormData();

    // Agregar campos básicos
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'imagenes' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Agregar imágenes
    if (payload.imagenes) {
      payload.imagenes.forEach((file: File) => {
        formData.append('imagenes', file);
      });
    }

    const { data } = await api.post("/epas", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    this.emit("epas:created", data);
    return data;
  }

  async updateEpa(id: number, payload: UpdateEpaInput): Promise<Epa> {
    const formData = new FormData();

    // Agregar campos básicos
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'imagenes' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Agregar imágenes
    if (payload.imagenes) {
      payload.imagenes.forEach((file: File) => {
        formData.append('imagenes', file);
      });
    }

    const { data } = await api.patch(`/epas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    this.emit("epas:updated", data);
    return data;
  }

  async removeEpa(id: number): Promise<void> {
    await api.delete(`/epas/${id}`);
    this.emit("epas:removed", { id_epa_pk: id });
  }

  // === WEBSOCKET ===

  connect(): Socket {
    if (!this.socket || this.socket.disconnected) {
      this.socket = connectSocket("/wiki");
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

export const fitosanitarioService = new FitosanitarioService();