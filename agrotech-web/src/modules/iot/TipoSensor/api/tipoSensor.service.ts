// src/modules/iot/tipo-sensor/api/tipoSensorService.ts
import api, { connectSocket } from "@/shared/api/client";
import type { Socket } from "socket.io-client";
import type { TipoSensor, CreateTipoSensorInput, UpdateTipoSensorInput } from "../model/types";
import { mapTipoSensorFromApi } from "../model/mappers";

const BASE = "/tipo-sensor";

function toFormData(data: Record<string, any>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    if (v instanceof File || v instanceof Blob) fd.append(k, v);
    else if (Array.isArray(v)) v.forEach((it) => fd.append(k, String(it)));
    else if (typeof v === "object") fd.append(k, JSON.stringify(v));
    else fd.append(k, String(v));
  }
  return fd;
}

export const tipoSensorService = {
  async list(): Promise<TipoSensor[]> {
    const { data } = await api.get(BASE);
    return data.map(mapTipoSensorFromApi);
  },
  async listDeleted(): Promise<TipoSensor[]> {
    const { data } = await api.get(`${BASE}/deleted`);
    return data.map(mapTipoSensorFromApi);
  },
  async getById(id: number): Promise<TipoSensor> {
    const { data } = await api.get(`${BASE}/${id}`);
    return mapTipoSensorFromApi(data);
  },
  async create(input: CreateTipoSensorInput): Promise<string> {
    const fd = toFormData(input as any);
    const { data } = await api.post<string>(BASE, fd);
    return data;
  },
  async update(id: number, input: UpdateTipoSensorInput): Promise<string> {
    const fd = toFormData(input as any);
    const { data } = await api.patch<string>(`${BASE}/${id}`, fd);
    return data;
  },
  async remove(id: number): Promise<string> {
    const { data } = await api.delete<string>(`${BASE}/${id}`);
    return data;
  },
  async restore(id: number): Promise<string> {
    const { data } = await api.patch<string>(`${BASE}/restore/${id}`);
    return data;
  },
};

export function socketTipoSensor(token?: string): Socket {
  return connectSocket("/tipo-sensor", token);
}
