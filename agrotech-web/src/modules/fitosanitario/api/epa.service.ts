// src/modules/fitosanitario/api/epa.service.ts
import api from "@/shared/api/client";
import type { Epa, CreateEpaInput, UpdateEpaInput } from "../model/types";
import { mapEpaFromBackend, mapCreateEpaInputToBackend, mapUpdateEpaInputToBackend } from "../model/mappers";

const BASE = "/epas";

export const epaService = {
  async list(params?: {
    q?: string;
    tipoId?: number;
    tipoCultivoEpaId?: number;
    page?: number;
    limit?: number;
  }): Promise<Epa[]> {
    const query: Record<string, any> = {};
    if (params?.q) query.q = params.q;
    if (params?.tipoId) query.tipoId = params.tipoId;
    if (params?.tipoCultivoEpaId) query.tipoCultivoEpaId = params.tipoCultivoEpaId;
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;

    const { data } = await api.get(BASE, { params: query });
    const raw = Array.isArray(data) ? data : data?.data || data?.items || [];
    return raw.map(mapEpaFromBackend);
  },

  async getById(id: number): Promise<Epa> {
    const { data } = await api.get(`${BASE}/${id}`);
    return mapEpaFromBackend(data);
  },

  async create(input: CreateEpaInput): Promise<Epa> {
    if (input.imagenes && input.imagenes.length > 0) {
      // Usar FormData para archivos
      const formData = new FormData();
      const body = mapCreateEpaInputToBackend(input);
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      input.imagenes.forEach((file) => {
        formData.append('imagenes', file);
      });
      const { data } = await api.post(BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return mapEpaFromBackend(data);
    } else {
      // Usar JSON normal
      const body = mapCreateEpaInputToBackend(input);
      const { data } = await api.post(BASE, body);
      return mapEpaFromBackend(data);
    }
  },

  async update(id: number, input: UpdateEpaInput): Promise<Epa> {
    if (input.imagenes && input.imagenes.length > 0) {
      // Usar FormData para archivos
      const formData = new FormData();
      const body = mapUpdateEpaInputToBackend(input);
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      input.imagenes.forEach((file) => {
        formData.append('imagenes', file);
      });
      const { data } = await api.patch(`${BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return mapEpaFromBackend(data);
    } else {
      // Usar JSON normal
      const body = mapUpdateEpaInputToBackend(input);
      const { data } = await api.patch(`${BASE}/${id}`, body);
      return mapEpaFromBackend(data);
    }
  },

  async remove(id: number): Promise<{ message: string; id: number }> {
    const { data } = await api.delete(`${BASE}/${id}`);
    return { message: data?.message ?? "EPA eliminado", id };
  },
};

// Re-exporta tipos para permitir `import type {...} from "../api/epa.service"`
export type { Epa, CreateEpaInput, UpdateEpaInput } from "../model/types";