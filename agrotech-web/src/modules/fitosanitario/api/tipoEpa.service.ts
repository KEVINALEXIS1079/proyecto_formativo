// src/modules/fitosanitario/api/tipoEpa.service.ts
import api from "@/shared/api/client";
import type { TipoEpa, CreateTipoEpaInput, UpdateTipoEpaInput } from "../model/types";
import { mapTipoEpaFromBackend, mapCreateTipoEpaInputToBackend, mapUpdateTipoEpaInputToBackend } from "../model/mappers";

const BASE = "/tipo-epa";

export const tipoEpaService = {
  async list(): Promise<TipoEpa[]> {
    const { data } = await api.get(BASE);
    const raw = Array.isArray(data) ? data : data?.data || data?.items || [];
    return raw.map(mapTipoEpaFromBackend);
  },

  async getById(id: number): Promise<TipoEpa> {
    const { data } = await api.get(`${BASE}/${id}`);
    return mapTipoEpaFromBackend(data);
  },

  async create(input: CreateTipoEpaInput): Promise<TipoEpa> {
    const body = mapCreateTipoEpaInputToBackend(input);
    const { data } = await api.post(BASE, body);
    return mapTipoEpaFromBackend(data);
  },

  async update(id: number, input: UpdateTipoEpaInput): Promise<TipoEpa> {
    const body = mapUpdateTipoEpaInputToBackend(input);
    const { data } = await api.patch(`${BASE}/${id}`, body);
    return mapTipoEpaFromBackend(data);
  },

  async remove(id: number): Promise<{ message: string; id: number }> {
    const { data } = await api.delete(`${BASE}/${id}`);
    return { message: data?.message ?? "Tipo EPA eliminado", id };
  },
};

// Re-exporta tipos para permitir `import type {...} from "../api/tipoEpa.service"`
export type { TipoEpa, CreateTipoEpaInput, UpdateTipoEpaInput } from "../model/types";