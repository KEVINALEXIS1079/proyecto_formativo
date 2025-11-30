// src/modules/fitosanitario/api/tipoCultivoEpa.service.ts
import api from "@/shared/api/client";
import type { TipoCultivoEpa, CreateTipoCultivoEpaInput, UpdateTipoCultivoEpaInput } from "../models/types";
import { mapTipoCultivoEpaFromBackend, mapCreateTipoCultivoEpaInputToBackend, mapUpdateTipoCultivoEpaInputToBackend } from "../models/mappers";

const BASE = "/tipo-cultivo-epa";

export const tipoCultivoEpaService = {
  async list(): Promise<TipoCultivoEpa[]> {
    const { data } = await api.get(BASE);
    const raw = Array.isArray(data) ? data : data?.data || data?.items || [];
    return raw.map(mapTipoCultivoEpaFromBackend);
  },

  async getById(id: number): Promise<TipoCultivoEpa> {
    const { data } = await api.get(`${BASE}/${id}`);
    return mapTipoCultivoEpaFromBackend(data);
  },

  async create(input: CreateTipoCultivoEpaInput): Promise<TipoCultivoEpa> {
    const body = mapCreateTipoCultivoEpaInputToBackend(input);
    const { data } = await api.post(BASE, body);
    return mapTipoCultivoEpaFromBackend(data);
  },

  async update(id: number, input: UpdateTipoCultivoEpaInput): Promise<TipoCultivoEpa> {
    const body = mapUpdateTipoCultivoEpaInputToBackend(input);
    const { data } = await api.patch(`${BASE}/${id}`, body);
    return mapTipoCultivoEpaFromBackend(data);
  },

  async remove(id: number): Promise<{ message: string; id: number }> {
    const { data } = await api.delete(`${BASE}/${id}`);
    return { message: data?.message ?? "Tipo Cultivo EPA eliminado", id };
  },
};

// Re-exporta tipos para permitir `import type {...} from "../api/tipoCultivoEpa.service"`
export type { TipoCultivoEpa, CreateTipoCultivoEpaInput, UpdateTipoCultivoEpaInput } from "../models/types";