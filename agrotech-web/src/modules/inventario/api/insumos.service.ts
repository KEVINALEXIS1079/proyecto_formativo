import { api } from "@/shared/api/client";
import { adaptInsumo } from "../model/mappers";
import type { Insumo, CreateInsumoInput, UpdateInsumoInput, RemoveInsumoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateInsumoInput) {
  return {
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    tipoMateria: dto.tipoMateria?.toLowerCase() || 'solido', // Asegurar que esté en minúsculas
    presentacionTipo: dto.presentacionTipo,
    presentacionCantidad: dto.presentacionCantidad,
    presentacionUnidad: dto.presentacionUnidad,
    unidadBase: dto.unidadBase,
    factorConversion: dto.factorConversion,
    stockPresentacion: dto.stockPresentaciones,
    precioUnitarioPresentacion: dto.precioUnitario,
    fechaRegistro: dto.fechaIngreso, // Mapear fechaIngreso a fechaRegistro
    almacenId: dto.idAlmacen,
    categoriaId: dto.idCategoria,
    proveedorId: dto.idProveedor,
    descripcionOperacion: dto.descripcionOperacion,
    creadoPorUsuarioId: dto.creadoPorUsuarioId, // Para el movimiento de inventario inicial
  };
}

function mapUpdateDtoToApi(dto: UpdateInsumoInput) {
  const out: any = {};
  if (dto.nombre !== undefined) out.nombre = dto.nombre;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  if (dto.tipoMateria !== undefined) {
    out.tipoMateria = dto.tipoMateria?.toLowerCase() || 'solido';
    console.log('DEBUG: Mapeando tipoMateria:', dto.tipoMateria, '->', out.tipoMateria);
  }
  if (dto.imagenUrl !== undefined) out.fotoUrl = dto.imagenUrl;
  if (dto.presentacionTipo !== undefined) out.presentacionTipo = dto.presentacionTipo;
  if (dto.presentacionCantidad !== undefined) out.presentacionCantidad = dto.presentacionCantidad;
  if (dto.presentacionUnidad !== undefined) out.presentacionUnidad = dto.presentacionUnidad;
  if (dto.unidadBase !== undefined) out.unidadUso = dto.unidadBase;
  if (dto.factorConversion !== undefined) out.factorConversionUso = dto.factorConversion;
  if (dto.stockPresentaciones !== undefined) out.stockPresentacion = dto.stockPresentaciones;
  if (dto.precioUnitario !== undefined) out.precioUnitarioPresentacion = dto.precioUnitario;
  if (dto.fechaIngreso !== undefined) out.fechaRegistro = dto.fechaIngreso;
  if (dto.idCategoria !== undefined) out.categoriaId = dto.idCategoria;
  if (dto.idProveedor !== undefined) out.proveedorId = dto.idProveedor;
  if (dto.idAlmacen !== undefined) {
    out.almacenId = dto.idAlmacen;
    console.log('DEBUG: Mapeando idAlmacen:', dto.idAlmacen, 'a almacenId:', out.almacenId);
  }
  if (dto.descripcionOperacion !== undefined) out.descripcionOperacion = dto.descripcionOperacion;
  console.log('DEBUG: mapUpdateDtoToApi - Input:', dto, 'Output:', out);
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

  async hasMovimientos(id: number): Promise<boolean> {
    const { data } = await api.get(`/insumos/${id}/has-movimientos`);
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
  formData.append('image', file);
  return api.post(`/insumos/${id}/upload-image`, formData);
};
export const hasMovimientos = (id: number) => insumosService.hasMovimientos(id);

export const createActivoFijo = (data: any, file?: File) => {
  if (file) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    formData.append('imagen', file);
    return api.post('/insumos/activos-fijos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/insumos/activos-fijos', data);
};

export const getActivosFijos = async () => {
  const { data } = await api.get('/insumos/activos-fijos');
  return normalizeListResp(data);
};

export const registrarMantenimiento = (id: number, data: { costo?: number; descripcion?: string }) => {
  return api.post(`/insumos/activos-fijos/${id}/mantenimiento`, data);
};

export const finalizarMantenimiento = (id: number) => {
  return api.patch(`/insumos/activos-fijos/${id}/finalizar-mantenimiento`);
};

export const getMovimientosByInsumo = async (insumoId: number) => {
  const { data } = await api.get('/insumos/movimientos', { params: { insumoId } });
  return data;
};