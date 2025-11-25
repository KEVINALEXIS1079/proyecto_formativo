import { api } from "@/shared/api/client";
import { adaptTipoActividad } from "../model/mappers";
import type { TipoActividad, CreateTipoActividadInput } from "../model/types";

function normalizeListResp(data: any): TipoActividad[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.tipo_actividad) && data.tipo_actividad) ||
    [];
  return (raw as any[]).map(adaptTipoActividad);
}

class TipoActividadService {
  async list(): Promise<TipoActividad[]> {
    const { data } = await api.get("/tipo-actividad");
    return normalizeListResp(data);
  }

  async get(id: number): Promise<TipoActividad> {
    const { data } = await api.get(`/tipo-actividad/${id}`);
    return adaptTipoActividad(data);
  }

  async create(payload: CreateTipoActividadInput): Promise<{ message: string; id: number }> {
    const { data } = await api.post("/tipo-actividad", { nombre_tipo_actividad: payload.nombre });
    const id = data?.id ?? data?.id_tipo_actividad_pk ?? 0;
    return { message: data?.message ?? "Tipo de actividad creado", id };
  }
}

export const tipoActividadService = new TipoActividadService();

export const listTipoActividad = () => tipoActividadService.list();
export const getTipoActividad = (id: number) => tipoActividadService.get(id);
export const createTipoActividad = (payload: CreateTipoActividadInput) => tipoActividadService.create(payload);