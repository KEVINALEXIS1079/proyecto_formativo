import { api } from "@/shared/api/client";
import { adaptTipoCultivo } from "../model/mappers";
import type { TipoCultivo, CreateTipoCultivoInput, UpdateTipoCultivoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateTipoCultivoInput) {
  return {
    nombre_tipo_cultivo: dto.nombre,
    descripcion: dto.descripcion,
  };
}

function mapUpdateDtoToApi(dto: UpdateTipoCultivoInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre_tipo_cultivo = dto.nombre;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  return out;
}

function normalizeListResp(data: any): TipoCultivo[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.tipos_cultivo) && data.tipos_cultivo) ||
    [];
  return (raw as any[]).map(adaptTipoCultivo);
}

class TiposCultivoService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<TipoCultivo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;

    const { data } = await api.get("/tipo-cultivo", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<TipoCultivo> {
    const { data } = await api.get(`/tipo-cultivo/${id}`);
    return adaptTipoCultivo(data);
  }

  async create(payload: CreateTipoCultivoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    const { data } = await api.post("/tipo-cultivo", body);
    const id = data?.id ?? data?.id_tipo_cultivo_pk ?? 0;
    return { message: data?.message ?? "Tipo de cultivo creado", id };
  }

  async update(id: number, payload: UpdateTipoCultivoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/tipo-cultivo/${id}`, body);
    return { message: data?.message ?? "Tipo de cultivo actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/tipo-cultivo/${id}`);
    return true;
  }
}

export const tiposCultivoService = new TiposCultivoService();

export const listTiposCultivo = (params?: { page?: number; limit?: number; q?: string }) =>
  tiposCultivoService.list(params);
export const getTipoCultivo = (id: number) => tiposCultivoService.get(id);
export const createTipoCultivo = (payload: CreateTipoCultivoInput) => tiposCultivoService.create(payload);
export const updateTipoCultivo = (id: number, payload: UpdateTipoCultivoInput) => tiposCultivoService.update(id, payload);
export const removeTipoCultivo = (id: number) => tiposCultivoService.remove(id);