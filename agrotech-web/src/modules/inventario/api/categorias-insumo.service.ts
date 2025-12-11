import { api } from "@/shared/api/client";
import { adaptCategoriaInsumo } from "../model/mappers";
import type { CategoriaInsumo, CreateCategoriaInsumoInput, UpdateCategoriaInsumoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateCategoriaInsumoInput) {
  return {
    nombre_categoria_insumo: dto.nombre,
    descripcion: dto.descripcion,
    tipoInsumo: dto.tipoInsumo || 'CONSUMIBLE', // Default to CONSUMIBLE
  };
}

function mapUpdateDtoToApi(dto: UpdateCategoriaInsumoInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre_categoria_insumo = dto.nombre;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  return out;
}

function normalizeListResp(data: any): CategoriaInsumo[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.categorias) && data.categorias) ||
    [];
  return (raw as any[]).map(adaptCategoriaInsumo);
}

class CategoriasInsumoService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    tipoInsumo?: string;
  }): Promise<CategoriaInsumo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.tipoInsumo) query.tipoInsumo = params.tipoInsumo;

    const { data } = await api.get("/insumos/categorias", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<CategoriaInsumo> {
    const { data } = await api.get(`/insumos/categorias/${id}`);
    return adaptCategoriaInsumo(data);
  }

  async create(payload: CreateCategoriaInsumoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    const { data } = await api.post("/insumos/categorias", body);
    const id = data?.id ?? data?.id_categoria_insumo_pk ?? 0;
    return { message: data?.message ?? "Categoría creada", id };
  }

  async update(id: number, payload: UpdateCategoriaInsumoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/insumos/categorias/${id}`, body);
    return { message: data?.message ?? "Categoría actualizada" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/insumos/categorias/${id}`);
    return true;
  }
}

export const categoriasInsumoService = new CategoriasInsumoService();

export const listCategoriasInsumo = (params?: { page?: number; limit?: number; q?: string; tipoInsumo?: string }) =>
  categoriasInsumoService.list(params);
export const getCategoriaInsumo = (id: number) => categoriasInsumoService.get(id);
export const createCategoriaInsumo = (payload: CreateCategoriaInsumoInput) => categoriasInsumoService.create(payload);
export const updateCategoriaInsumo = (id: number, payload: UpdateCategoriaInsumoInput) => categoriasInsumoService.update(id, payload);
export const removeCategoriaInsumo = (id: number) => categoriasInsumoService.remove(id);