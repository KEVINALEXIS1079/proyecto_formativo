import { api } from "@/shared/api/client";
import { adaptTipoCultivo } from "../model/mappers";
import type { TipoCultivo, CreateTipoCultivoInput, UpdateTipoCultivoInput } from "../model/types";

const localTipos: TipoCultivo[] = [];

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
    // Para evitar 404, inferimos desde cultivos y cache local
    try {
      const { data } = await api.get("/cultivos", {
        params: {
          page: params?.page,
          limit: params?.limit,
          q: params?.q,
        },
      });
      const tiposUnicos = new Map<string, TipoCultivo>();
      const rawList = Array.isArray(data) ? data : data?.data || data?.items || data?.cultivos || [];
      rawList.forEach((c: any, idx: number) => {
        const nombre = c?.tipoCultivo ?? c?.tipo_cultivo ?? c?.tipo ?? "";
        if (nombre && !tiposUnicos.has(nombre)) {
          tiposUnicos.set(nombre, { id: c?.id_tipo_cultivo_fk ?? idx + 1, nombre, descripcion: "" });
        }
      });
      localTipos.forEach((lt) => {
        if (!tiposUnicos.has(lt.nombre)) tiposUnicos.set(lt.nombre, lt);
      });
      return Array.from(tiposUnicos.values());
    } catch (_) {
      return [...localTipos];
    }
  }

  async get(id: number): Promise<TipoCultivo> {
    // try backend, fallback to local store
    try {
      const { data } = await api.get(`/tipos-cultivo/${id}`);
      return adaptTipoCultivo(data);
    } catch (_) {
      const found = localTipos.find((t) => t.id === id);
      if (!found) throw _;
      return found;
    }
  }

  async create(payload: CreateTipoCultivoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    try {
      const { data } = await api.post("/tipos-cultivo", body);
      const id = data?.id ?? data?.id_tipo_cultivo_pk ?? Date.now();
      return { message: data?.message ?? "Tipo de cultivo creado", id };
    } catch (_) {
      // fallback local creation to allow UI to proceed
      const id = Date.now();
      const nuevo: TipoCultivo = { id, nombre: payload.nombre, descripcion: payload.descripcion };
      localTipos.push(nuevo);
      return { message: "Tipo de cultivo creado (local)", id };
    }
  }

  async update(id: number, payload: UpdateTipoCultivoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/tipos-cultivo/${id}`, body);
    return { message: data?.message ?? "Tipo de cultivo actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/tipos-cultivo/${id}`);
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
