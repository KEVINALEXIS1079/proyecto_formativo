import { api } from "@/shared/api/client";
import { adaptInsumo } from "../model/mappers";
import type { Insumo, CreateInsumoInput, UpdateInsumoInput, RemoveInsumoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateInsumoInput) {
  return {
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    imagen_url: dto.imagenUrl,
    presentacion_tipo: dto.presentacionTipo,
    presentacion_cantidad: dto.presentacionCantidad,
    presentacion_unidad: dto.presentacionUnidad,
    unidad_base: dto.unidadBase,
    factor_conversion: dto.factorConversion,
    stock_presentaciones: dto.stockPresentaciones,
    precio_unitario_actual: dto.precioUnitario,
    fecha_ingreso: dto.fechaIngreso,
    id_categoria_insumo_fk: dto.idCategoria,
    id_proveedor_fk: dto.idProveedor,
    id_almacen_fk: dto.idAlmacen,
    descripcion_operacion: dto.descripcionOperacion,
  };
}

function mapUpdateDtoToApi(dto: UpdateInsumoInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre = dto.nombre;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  if (dto.imagenUrl !== undefined) out.imagen_url = dto.imagenUrl;
  if (dto.presentacionTipo !== undefined) out.presentacion_tipo = dto.presentacionTipo;
  if (dto.presentacionCantidad !== undefined) out.presentacion_cantidad = dto.presentacionCantidad;
  if (dto.presentacionUnidad !== undefined) out.presentacion_unidad = dto.presentacionUnidad;
  if (dto.unidadBase !== undefined) out.unidad_base = dto.unidadBase;
  if (dto.factorConversion !== undefined) out.factor_conversion = dto.factorConversion;
  if (dto.stockPresentaciones !== undefined) out.stock_presentaciones = dto.stockPresentaciones;
  if (dto.precioUnitario !== undefined) out.precio_unitario_actual = dto.precioUnitario;
  if (dto.fechaIngreso !== undefined) out.fecha_ingreso = dto.fechaIngreso;
  if (dto.idCategoria !== undefined) out.id_categoria_insumo_fk = dto.idCategoria;
  if (dto.idProveedor !== undefined) out.id_proveedor_fk = dto.idProveedor;
  if (dto.idAlmacen !== undefined) out.id_almacen_fk = dto.idAlmacen;
  if (dto.descripcionOperacion !== undefined) out.descripcion_operacion = dto.descripcionOperacion;
  return out;
}

function normalizeListResp(data: any): Insumo[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.insumos) && data.insumos) ||
    [];
  return (raw as any[]).map(adaptInsumo);
}

class InsumosService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    categoriaId?: number;
    proveedorId?: number;
    almacenId?: number;
  }): Promise<Insumo[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.categoriaId) query.categoriaId = params.categoriaId;
    if (params?.proveedorId) query.proveedorId = params.proveedorId;
    if (params?.almacenId) query.almacenId = params.almacenId;

    const { data } = await api.get("/insumos", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<Insumo> {
    const { data } = await api.get(`/insumos/${id}`);
    return adaptInsumo(data);
  }

  async create(payload: CreateInsumoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    console.log("Payload enviado a API:", body);
    const { data } = await api.post("/insumos", body);
    const id = data?.id ?? data?.id_insumo_pk ?? 0;
    return { message: data?.message ?? "Insumo creado", id };
  }

  async update(id: number, payload: UpdateInsumoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/insumos/${id}`, body);
    return { message: data?.message ?? "Insumo actualizado" };
  }

  async remove(id: number, payload: RemoveInsumoInput): Promise<boolean> {
    await api.delete(`/insumos/${id}`, { data: payload });
    return true;
  }

  async getHistory(id: number): Promise<any[]> {
    const { data } = await api.get(`/insumos/${id}/history`);
    return data;
  }

  async getAllHistory(): Promise<any[]> {
    const { data } = await api.get(`/insumos/history/all`);
    return data;
  }
}

export const insumosService = new InsumosService();

export const listInsumos = (params?: { page?: number; limit?: number; q?: string; categoriaId?: number; proveedorId?: number; almacenId?: number }) =>
  insumosService.list(params);
export const getInsumo = (id: number) => insumosService.get(id);
export const createInsumo = (payload: CreateInsumoInput) => insumosService.create(payload);
export const updateInsumo = (id: number, payload: UpdateInsumoInput) => insumosService.update(id, payload);
export const removeInsumo = (id: number, payload: RemoveInsumoInput) => insumosService.remove(id, payload);
export const getInsumoHistory = (id: number) => insumosService.getHistory(id);
export const getAllInsumoHistory = () => insumosService.getAllHistory();
export const uploadInsumoImage = (id: number, file: File) => {
  const formData = new FormData();
  formData.append('imagen', file);
  return api.post(`/insumos/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};