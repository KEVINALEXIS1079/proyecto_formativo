// src/modules/fitosanitario/api/epa.service.ts
import api from "@/shared/api/client";
import type { Epa, CreateEpaInput, UpdateEpaInput } from "../models/types";
import { mapEpaFromBackend, mapCreateEpaInputToBackend, mapUpdateEpaInputToBackend, createMapCreateEpaInputToBackend } from "../models/mappers";

const BASE = "/epas";

export const epaService = {
  async list(params?: {
    q?: string;
    tipoId?: number;
    tipoCultivoEpaId?: number;
  }): Promise<Epa[]> {
    const query: Record<string, any> = {};
    if (params?.q) query.q = params.q;
    if (params?.tipoId) query.tipoId = params.tipoId;
    if (params?.tipoCultivoEpaId) query.tipoCultivoEpaId = params.tipoCultivoEpaId;

    const { data } = await api.get(BASE, { params: query });
    return data.map(mapEpaFromBackend);
  },

  async getById(id: number): Promise<Epa> {
    const { data } = await api.get(`${BASE}/${id}`);
    return mapEpaFromBackend(data);
  },

  async create(input: CreateEpaInput, tiposEpa?: Array<{id: number, tipoEpaEnum: string}>): Promise<Epa> {
    console.log("=== EPA SERVICE CREATE DEBUG ===");
    console.log("Input original:", JSON.stringify(input, null, 2));
    console.log("Tipos EPA disponibles:", tiposEpa);

    // Usar el mapper con tipos EPA si están disponibles y no vacíos
    const mapToBackend = (tiposEpa && tiposEpa.length > 0)
      ? createMapCreateEpaInputToBackend(tiposEpa)
      : mapCreateEpaInputToBackend;

    const body = mapToBackend(input);
    console.log("Body mapeado:", JSON.stringify(body, null, 2));

    // VALIDACIÓN FINAL: Asegurar campos requeridos
    console.log("=== VALIDACIÓN FINAL ===");
    console.log("body.nombre:", `"${body.nombre}"`, "type:", typeof body.nombre);
    console.log("body.tipoEpa:", `"${body.tipoEpa}"`, "type:", typeof body.tipoEpa);

    if (!body.nombre || body.nombre === "") {
      throw new Error(`Campo nombre faltante o vacío: nombre="${body.nombre}"`);
    }
    if (!body.tipoEpa || body.tipoEpa === "") {
      throw new Error(`Campo tipoEpa faltante o vacío: tipoEpa="${body.tipoEpa}"`);
    }

    console.log(" Campos requeridos válidos - Enviando como FormData");

    // Usar FormData para archivos
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Agregar fotos de síntomas
    if (input.fotosSintomas && input.fotosSintomas.length > 0) {
      input.fotosSintomas.forEach((file) => {
        formData.append('fotosSintomas', file);
      });
    }

    // Agregar fotos generales
    if (input.fotosGenerales && input.fotosGenerales.length > 0) {
      input.fotosGenerales.forEach((file) => {
        formData.append('fotosGenerales', file);
      });
    }

    const { data } = await api.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapEpaFromBackend(data);
  },

  async update(id: number, input: UpdateEpaInput): Promise<Epa> {
    console.log("=== EPA SERVICE UPDATE DEBUG ===");
    console.log("ID:", id);
    console.log("Input keys:", Object.keys(input));

    const hasFiles = (input.fotosSintomas && input.fotosSintomas.length > 0) ||
                     (input.fotosGenerales && input.fotosGenerales.length > 0);

    if (hasFiles) {
      // Usar FormData para archivos
      console.log("Using FormData for files");
      const formData = new FormData();
      const body = mapUpdateEpaInputToBackend(input);
      console.log("Body from mapper:", JSON.stringify(body, null, 2));
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Agregar fotos de síntomas
      if (input.fotosSintomas && input.fotosSintomas.length > 0) {
        input.fotosSintomas.forEach((file) => {
          formData.append('fotosSintomas', file);
        });
      }

      // Agregar fotos generales
      if (input.fotosGenerales && input.fotosGenerales.length > 0) {
        input.fotosGenerales.forEach((file) => {
          formData.append('fotosGenerales', file);
        });
      }

      console.log("FormData created, sending PATCH request...");
      const { data } = await api.patch(`${BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("Response received:", data);
      return mapEpaFromBackend(data);
    } else {
      // Usar JSON normal
      console.log("Using JSON for update");
      const body = mapUpdateEpaInputToBackend(input);
      console.log("Body mapeado:", JSON.stringify(body, null, 2));

      // Verificar que el body no esté vacío
      if (!body || Object.keys(body).length === 0) {
        throw new Error("Body mapeado está vacío - no hay datos para actualizar");
      }

      console.log("Sending PATCH request with JSON body...");
      const { data } = await api.patch(`${BASE}/${id}`, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("Response received:", data);
      return mapEpaFromBackend(data);
    }
  },

  async remove(id: number): Promise<{ message: string; id: number }> {
    console.log("=== EPA SERVICE REMOVE DEBUG ===");
    console.log("ID:", id);

    const { data } = await api.delete(`${BASE}/${id}`);
    return { message: data?.message ?? "EPA eliminado", id };
  },
};

// Re-exporta tipos para permitir `import type {...} from "../api/epa.service"`
export type { Epa, CreateEpaInput, UpdateEpaInput } from "../models/types";