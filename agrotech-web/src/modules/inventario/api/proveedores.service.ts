import { api } from "@/shared/api/client";
import { adaptProveedor } from "../model/mappers";
import type { Proveedor, CreateProveedorInput, UpdateProveedorInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateProveedorInput) {
  return {
    nombre: dto.nombre,
  };
}

function mapUpdateDtoToApi(dto: UpdateProveedorInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre = dto.nombre;
  return out;
}

function normalizeListResp(data: any): Proveedor[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.proveedores) && data.proveedores) ||
    [];
  return (raw as any[]).map(adaptProveedor);
}

class ProveedoresService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Proveedor[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;

    const { data } = await api.get("/insumos/proveedores", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Proveedor> {
    const { data } = await api.get(`/insumos/proveedores/${id}`);
    return adaptProveedor(data);
  }

  async create(payload: CreateProveedorInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    console.log("DEBUG: Enviando a API proveedores:", body);
    const { data } = await api.post("/insumos/proveedores", body);
    const id = data?.id ?? data?.id_proveedor_pk ?? 0;
    return { message: data?.message ?? "Proveedor creado", id };
  }

  async update(id: number, payload: UpdateProveedorInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/insumos/proveedores/${id}`, body);
    return { message: data?.message ?? "Proveedor actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/insumos/proveedores/${id}`);
    return true;
  }
}

export const proveedoresService = new ProveedoresService();

export const listProveedores = (params?: { page?: number; limit?: number; q?: string }) =>
  proveedoresService.list(params);
export const getProveedor = (id: number) => proveedoresService.get(id);
export const createProveedor = (payload: CreateProveedorInput) => proveedoresService.create(payload);
export const updateProveedor = (id: number, payload: UpdateProveedorInput) => proveedoresService.update(id, payload);
export const removeProveedor = (id: number) => proveedoresService.remove(id);