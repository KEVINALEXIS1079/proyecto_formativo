import { api } from "@/shared/api/client";
import { adaptActividad } from "../model/mappers";
import type { Actividad, CreateActividadInput, UpdateActividadInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateActividadInput) {
  const out: any = {
    descripcion_actividad: dto.descripcion_actividad,
    nombre_actividad: dto.nombre_actividad,
    costo_mano_obra_actividad: dto.costo_mano_obra_actividad,
    fecha_actividad: dto.fecha_actividad,
    fecha_inicio_actividad: dto.fecha_inicio_actividad,
    fecha_fin_actividad: dto.fecha_fin_actividad,
    tipo_actividad: dto.tipo_actividad,
    estado_actividad: dto.estado_actividad,
    id_tipo_actividad_fk: dto.id_tipo_actividad_fk,
    id_lote_fk: dto.id_lote_fk,
    id_sublote_fk: dto.id_sublote_fk,
    id_cultivo_fk: dto.id_cultivo_fk,
    subtipos: dto.subtipos,
    participantes: dto.participantes,
    insumos: dto.insumos,
    evidencias: dto.evidencias,
  };
  if (dto.servicios && dto.servicios.length > 0) {
    out.servicios = dto.servicios;
  }
  return out;
}

function mapUpdateDtoToApi(dto: UpdateActividadInput) {
  const out: any = {};
  if (dto.descripcion_actividad !== undefined) out.descripcion_actividad = dto.descripcion_actividad;
  if (dto.nombre_actividad !== undefined) out.nombre_actividad = dto.nombre_actividad;
  if (dto.costo_mano_obra_actividad !== undefined) out.costo_mano_obra_actividad = dto.costo_mano_obra_actividad;
  if (dto.fecha_actividad !== undefined) out.fecha_actividad = dto.fecha_actividad;
  if (dto.fecha_inicio_actividad !== undefined) out.fecha_inicio_actividad = dto.fecha_inicio_actividad;
  if (dto.fecha_fin_actividad !== undefined) out.fecha_fin_actividad = dto.fecha_fin_actividad;
  if (dto.tipo_actividad !== undefined) out.tipo_actividad = dto.tipo_actividad;
  if (dto.estado_actividad !== undefined) out.estado_actividad = dto.estado_actividad;
  if (dto.id_tipo_actividad_fk !== undefined) out.id_tipo_actividad_fk = dto.id_tipo_actividad_fk;
  if (dto.id_lote_fk !== undefined) out.id_lote_fk = dto.id_lote_fk;
  if (dto.id_sublote_fk !== undefined) out.id_sublote_fk = dto.id_sublote_fk;
  if (dto.id_cultivo_fk !== undefined) out.id_cultivo_fk = dto.id_cultivo_fk;
  if (dto.subtipos !== undefined) out.subtipos = dto.subtipos;
  if (dto.participantes !== undefined) out.participantes = dto.participantes;
  if (dto.insumos !== undefined) out.insumos = dto.insumos;
  if (dto.servicios !== undefined) out.servicios = dto.servicios;
  if (dto.evidencias !== undefined) out.evidencias = dto.evidencias;
  return out;
}

function normalizeListResp(data: any): Actividad[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.actividades) && data.actividades) ||
    [];
  return (raw as any[]).map(adaptActividad);
}

class ActividadesService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    tipoActividadId?: number;
  }): Promise<Actividad[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.tipoActividadId) query.tipoActividadId = params.tipoActividadId;

    const { data } = await api.get("/actividades", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Actividad> {
    const { data } = await api.get(`/actividades/${id}`);
    return adaptActividad(data);
  }

  async create(payload: CreateActividadInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    console.log('Payload original:', JSON.stringify(payload, null, 2));
    console.log('Body mapeado:', JSON.stringify(body, null, 2));
    const { data } = await api.post("/actividades", body);
    const id = data?.id ?? data?.id_actividad_pk ?? 0;
    return { message: data?.message ?? "Actividad creada", id };
  }

  async update(id: number, payload: UpdateActividadInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/actividades/${id}`, body);
    return { message: data?.message ?? "Actividad actualizada" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/actividades/${id}`);
    return true;
  }
}

export const actividadesService = new ActividadesService();

export const listActividades = (params?: { page?: number; limit?: number; q?: string; tipoActividadId?: number }) =>
  actividadesService.list(params);
export const getActividad = (id: number) => actividadesService.get(id);
export const createActividad = (payload: CreateActividadInput) => actividadesService.create(payload);
export const updateActividad = (id: number, payload: UpdateActividadInput) => actividadesService.update(id, payload);
export const removeActividad = (id: number) => actividadesService.remove(id);

export const uploadEvidencia = async (file: File): Promise<{ filename: string; path: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/actividades/upload-evidencia', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};