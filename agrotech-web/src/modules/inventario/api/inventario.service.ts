import type { Insumo, MovimientoInventario, CreateInsumoInput, UpdateInsumoInput, CreateMovimientoInput } from "../model/types";
import { api, connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";

class InventarioService {
  private socket: Socket | null = null;

  // === INSUMOS ===

  async listInsumos(query?: any): Promise<Insumo[]> {
    const { data } = await api.get("/insumos", { params: query });
    return data?.data || [];
  }

  async getInsumoById(id: number): Promise<Insumo> {
    const { data } = await api.get(`/insumos/${id}`);
    return data;
  }

  async createInsumo(payload: CreateInsumoInput): Promise<Insumo> {
    const { data } = await api.post("/insumos", payload);
    this.emit("insumos:created", data);
    return data;
  }

  async updateInsumo(id: number, payload: UpdateInsumoInput): Promise<Insumo> {
    const { data } = await api.patch(`/insumos/${id}`, payload);
    this.emit("insumos:updated", data);
    return data;
  }

  async removeInsumo(id: number, payload: { descripcion: string }): Promise<void> {
    await api.delete(`/insumos/${id}`, { data: payload });
    this.emit("insumos:deleted", { id_insumo_pk: id });
  }

  // === MOVIMIENTOS ===

  async listMovimientos(query?: any): Promise<MovimientoInventario[]> {
    const { data } = await api.get("/movimientos-inventario", { params: query });
    return data?.data || [];
  }

  async getMovimientoById(id: number): Promise<MovimientoInventario> {
    const { data } = await api.get(`/movimientos-inventario/${id}`);
    return data;
  }

  async createMovimiento(payload: CreateMovimientoInput): Promise<MovimientoInventario> {
    const { data } = await api.post("/movimientos-inventario", payload);
    this.emit("movimientos:created", data);
    return data;
  }

  async updateMovimiento(id: number, payload: Partial<CreateMovimientoInput>): Promise<MovimientoInventario> {
    const { data } = await api.patch(`/movimientos-inventario/${id}`, payload);
    this.emit("movimientos:updated", data);
    return data;
  }

  async removeMovimiento(id: number): Promise<void> {
    await api.delete(`/movimientos-inventario/${id}`);
    this.emit("movimientos:removed", { id_movimiento_inventario_pk: id });
  }

  // === WEBSOCKET ===

  connect(): Socket {
    if (!this.socket || this.socket.disconnected) {
      this.socket = connectSocket("/inventario");
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
  onCreated(cb: (insumo: any) => void) {
    this.on("insumos:created", cb);
  }
  onUpdated(cb: (insumo: any) => void) {
    this.on("insumos:updated", cb);
  }
  onDeleted(cb: (data: any) => void) {
    this.on("insumos:deleted", cb);
  }
  onRestored(cb: (insumo: any) => void) {
    this.on("insumos:restored", cb);
  }

  offCreated(cb?: (insumo: any) => void) {
    this.off("insumos:created", cb);
  }
  offUpdated(cb?: (insumo: any) => void) {
    this.off("insumos:updated", cb);
  }
  offDeleted(cb?: (data: any) => void) {
    this.off("insumos:deleted", cb);
  }
  offRestored(cb?: (insumo: any) => void) {
    this.off("insumos:restored", cb);
  }
}

export const inventarioService = new InventarioService();