// src/modules/iot/Sensor/api/sensorService.ts
import api, { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";
import type { Sensor, CreateSensorInput, UpdateSensorInput, SensorLectura } from "../model/types";

const BASE = "/sensores";

export const sensorService = {
  async list(): Promise<Sensor[]> {
    const { data } = await api.get<Sensor[]>(BASE);
    return data;
  },
  async listDeleted(): Promise<Sensor[]> {
    const { data } = await api.get<Sensor[]>(`${BASE}/deleted`);
    return data;
  },
  async getById(id: number): Promise<Sensor> {
    const { data } = await api.get<Sensor>(`${BASE}/${id}`);
    return data;
  },
  async create(input: CreateSensorInput): Promise<Sensor> {
    const { data } = await api.post<Sensor>(BASE, input);
    return data;
  },
  async update(id: number, input: UpdateSensorInput): Promise<Sensor> {
    const { data } = await api.patch<Sensor>(`${BASE}/${id}`, input);
    return data;
  },
  async remove(id: number): Promise<{ message: string; id: number }> {
    const { data } = await api.delete<{ message: string; id: number }>(`${BASE}/${id}`);
    return data;
  },
  async restore(id: number): Promise<Sensor> {
    const { data } = await api.patch<Sensor>(`${BASE}/restore/${id}`);
    return data;
  },

  // ✅ único método para historial (DESC) + paginación
  async historial(id: number, opt?: { limit?: number; before?: string }): Promise<SensorLectura[]> {
    const params = new URLSearchParams();
    if (opt?.limit) params.set("limit", String(opt.limit));
    if (opt?.before) params.set("before", opt.before);
    const qs = params.toString();
    const url = qs ? `${BASE}/${id}/historial?${qs}` : `${BASE}/${id}/historial`;
    const { data } = await api.get<SensorLectura[]>(url);
    return data ?? [];
  },

  // ⚠️ compatibilidad por si en otros archivos quedó getHistorial
  async getHistorial(id: number, opt?: { limit?: number; before?: string }) {
    return this.historial(id, opt);
  },
};

export function socketSensores(token?: string): Socket {
  return connectSocket("/sensores", token);
}

// 👇 Re-exporta tipos para permitir `import type {...} from "../api/sensorService"`
export type { Sensor, CreateSensorInput, UpdateSensorInput, SensorLectura } from "../model/types";
