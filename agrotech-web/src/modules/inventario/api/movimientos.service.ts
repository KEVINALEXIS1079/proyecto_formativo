import { api } from "@/shared/api/client";
import { adaptMovimiento } from "../model/mappers";
import type { MovimientoInventario, CreateMovimientoInput, UpdateMovimientoInput } from "../model/types";

function mapCreateDtoToApi(dto: CreateMovimientoInput) {
  return {
    tipo_movimiento: dto.tipoMovimiento,
    cantidad_presentaciones: dto.cantidadPresentaciones,
    cantidad_base: dto.cantidadBase,
    valor_movimiento: dto.valorMovimiento,
    descripcion: dto.descripcion,
    fecha_movimiento: dto.fechaMovimiento,
    origen: dto.origen,
    id_usuario_responsable_fk: dto.idUsuarioResponsable,
    id_insumo_fk: dto.idInsumo,
  };
}

function mapUpdateDtoToApi(dto: UpdateMovimientoInput) {
  const out: any = {};
  if (dto.tipoMovimiento !== undefined) out.tipo_movimiento = dto.tipoMovimiento;
  if (dto.cantidadPresentaciones !== undefined) out.cantidad_presentaciones = dto.cantidadPresentaciones;
  if (dto.cantidadBase !== undefined) out.cantidad_base = dto.cantidadBase;
  if (dto.valorMovimiento !== undefined) out.valor_movimiento = dto.valorMovimiento;
  if (dto.descripcion !== undefined) out.descripcion = dto.descripcion;
  if (dto.fechaMovimiento !== undefined) out.fecha_movimiento = dto.fechaMovimiento;
  if (dto.origen !== undefined) out.origen = dto.origen;
  if (dto.idUsuarioResponsable !== undefined) out.id_usuario_responsable_fk = dto.idUsuarioResponsable;
  if (dto.idInsumo !== undefined) out.id_insumo_fk = dto.idInsumo;
  return out;
}

function normalizeListResp(data: any): MovimientoInventario[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.movimientos) && data.movimientos) ||
    [];
  console.log('Raw movimientos data before mapping:', raw);
  return (raw as any[]).map(adaptMovimiento);
}

class MovimientosService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
    idInsumo?: number;
    tipoMovimiento?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<MovimientoInventario[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) query.q = params.q;
    if (params?.idInsumo) query.insumoId = params.idInsumo;
    if (params?.tipoMovimiento) query.tipoMovimiento = params.tipoMovimiento;
    if (params?.fechaDesde) query.fechaDesde = params.fechaDesde;
    if (params?.fechaHasta) query.fechaHasta = params.fechaHasta;

    const { data } = await api.get("/insumos/movimientos", { params: query });
    return normalizeListResp(data);
  }

  async get(id: number): Promise<MovimientoInventario> {
    const { data } = await api.get(`/insumos/movimientos/${id}`);
    return adaptMovimiento(data);
  }

  async create(payload: CreateMovimientoInput): Promise<{ message: string; id: number }> {
    const body = mapCreateDtoToApi(payload);
    const { data } = await api.post("/insumos/movimientos", body);
    const id = data?.id ?? data?.id_movimiento_pk ?? 0;
    return { message: data?.message ?? "Movimiento creado", id };
  }

  async update(id: number, payload: UpdateMovimientoInput): Promise<{ message: string }> {
    const body = mapUpdateDtoToApi(payload);
    const { data } = await api.patch(`/insumos/movimientos/${id}`, body);
    return { message: data?.message ?? "Movimiento actualizado" };
  }

  async remove(id: number): Promise<boolean> {
    await api.delete(`/insumos/movimientos/${id}`);
    return true;
  }
}

export const movimientosService = new MovimientosService();

export const listMovimientos = (params?: { page?: number; limit?: number; q?: string; idInsumo?: number; tipoMovimiento?: string; fechaDesde?: string; fechaHasta?: string }) =>
  movimientosService.list(params);
export const getMovimiento = (id: number) => movimientosService.get(id);
export const createMovimiento = (payload: CreateMovimientoInput) => movimientosService.create(payload);
export const updateMovimiento = (id: number, payload: UpdateMovimientoInput) => movimientosService.update(id, payload);
export const removeMovimiento = (id: number) => movimientosService.remove(id);