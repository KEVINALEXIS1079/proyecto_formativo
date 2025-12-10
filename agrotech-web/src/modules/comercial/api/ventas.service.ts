import type { Venta, CreateVentaDto } from "../models/types/sales.types";
import { mapVentaFromApi, mapVentaToApi } from "../models/mappers";
import { api } from "@/shared/api/client";

// Define local alias if Types does not export VentaFilters
interface VentaFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  cliente?: string;
  id_cultivo?: number;
}

class VentaService {
  async listVentas(filters?: VentaFilters): Promise<Venta[]> {
    const params = new URLSearchParams();
    if (filters?.fecha_desde) params.append('fechaInicio', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fechaFin', filters.fecha_hasta);
    if (filters?.cliente) params.append('clienteId', filters.cliente); // assuming cliente is ID, if name logic needed change here.
    // Backend filters: clienteId, fechaInicio, fechaFin.

    // Note: id_cultivo is not a direct filter in findVentas in backend? 
    // Backend ProductionController.findAllVentas filters: { clienteId, fechaInicio, fechaFin }
    // So id_cultivo might be ignored or handled by extra logic. I will omit it or keeps params as is if backend ignores.

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/production/ventas${query}`);
    return Array.isArray(data) ? data.map(mapVentaFromApi) : [];
  }

  async getVentaById(id: number): Promise<Venta> {
    const { data } = await api.get(`/production/ventas/${id}`);
    return mapVentaFromApi(data);
  }

  async createVenta(payload: CreateVentaDto): Promise<Venta> {
    const { data } = await api.post("/production/ventas", mapVentaToApi(payload));
    return mapVentaFromApi(data);
  }

  /*
  async updateVenta(id: number, payload: CreateVentaDto): Promise<Venta> {
     // NOTE: ProductionController does NOT have updateVenta endpoint!
     // It has: create, findAll, findOne, anular.
     // So update is NOT supported by backend yet. 
    throw new Error("Update Venta not supported by backend");
    // const { data } = await api.patch(`/production/ventas/${id}`, mapVentaToApi(payload));
    // return mapVentaFromApi(data);
  }
  */

  async removeVenta(id: number): Promise<boolean> {
    // Backend has anularVenta (POST /production/ventas/:id/anular).
    // It does NOT have DELETE.
    await api.post(`/production/ventas/${id}/anular`);
    return true;
  }
}

export const ventaService = new VentaService();