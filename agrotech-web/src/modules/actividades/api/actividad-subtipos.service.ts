import { api } from "@/shared/api/client";
import { adaptActividadSubtipo } from "../model/mappers";
import type { ActividadSubtipo, CreateActividadSubtipoInput, UpdateActividadSubtipoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateActividadSubtipoInput) {
  return {
    nombre_actividad_subtipo: dto.nombre,
    id_tipo_actividad_fk: dto.idTipoActividad,
  };
}

function mapUpdateDtoToApi(dto: UpdateActividadSubtipoInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre_actividad_subtipo = dto.nombre;
  if (dto.idTipoActividad !== undefined) out.id_tipo_actividad_fk = dto.idTipoActividad;
  return out;
}

function normalizeListResp(data: any): ActividadSubtipo[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.actividad_subtipos) && data.actividad_subtipos) ||
    [];
  return (raw as any[]).map(adaptActividadSubtipo);
}

class ActividadSubtiposService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    tipoActividadId?: number;
  }): Promise<ActividadSubtipo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.tipoActividadId) query.tipoActividadId = params.tipoActividadId;

    const { data } = await api.get("/actividad-subtipos", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<ActividadSubtipo> {
    const { data } = await api.get(`/actividad-subtipos/${id}`);
    return adaptActividadSubtipo(data);
  }


  async update(id: number, payload: UpdateActividadSubtipoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/actividad-subtipos/${id}`, body);
    return { message: data?.message ?? "Subtipo de actividad actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/actividad-subtipos/${id}`);
    return true;
  }
}

export const actividadSubtiposService = new ActividadSubtiposService();

export const listActividadSubtipos = (params?: {
  page?: number;
  limit?: number;
  q?: string;
  tipoActividadId?: number;
}) => actividadSubtiposService.list(params);

export const getActividadSubtipo = (id: number) => actividadSubtiposService.get(id);
export const updateActividadSubtipo = (id: number, payload: UpdateActividadSubtipoInput) => actividadSubtiposService.update(id, payload);
export const removeActividadSubtipo = (id: number) => actividadSubtiposService.remove(id);