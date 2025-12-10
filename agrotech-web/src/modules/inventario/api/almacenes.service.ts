import { api } from "@/shared/api/client";
import { adaptAlmacen } from "../model/mappers";
import type { Almacen, CreateAlmacenInput, UpdateAlmacenInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateAlmacenInput) {
  return {
    nombre: dto.nombre,
    descripcion: dto.descripcion,
  };
}

function mapUpdateDtoToApi(dto: UpdateAlmacenInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre = dto.nombre;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  return out;
}

function normalizeListResp(data: any): Almacen[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.almacenes) && data.almacenes) ||
    [];
  return (raw as any[]).map(adaptAlmacen);
}

class AlmacenesService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Almacen[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;

    const { data } = await api.get("/insumos/almacenes", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Almacen> {
    const { data } = await api.get(`/insumos/almacenes/${id}`);
    return adaptAlmacen(data);
  }

  async create(payload: CreateAlmacenInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    console.log("DEBUG: Enviando a API almacenes:", body);
    const { data } = await api.post("/insumos/almacenes", body);
    const id = data?.id ?? data?.id_almacen_pk ?? 0;
    return { message: data?.message ?? "Almacén creado", id };
  }

  async update(id: number, payload: UpdateAlmacenInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/insumos/almacenes/${id}`, body);
    return { message: data?.message ?? "Almacén actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/insumos/almacenes/${id}`);
    return true;
  }
}

export const almacenesService = new AlmacenesService();

export const listAlmacenes = (params?: { page?: number; limit?: number; q?: string }) =>
  almacenesService.list(params);
export const getAlmacen = (id: number) => almacenesService.get(id);
export const createAlmacen = (payload: CreateAlmacenInput) => almacenesService.create(payload);
export const updateAlmacen = (id: number, payload: UpdateAlmacenInput) => almacenesService.update(id, payload);
export const removeAlmacen = (id: number) => almacenesService.remove(id);