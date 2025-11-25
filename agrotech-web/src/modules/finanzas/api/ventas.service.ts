import type { Venta, CreateVentaDTO, VentaFilters } from "../model/types";
import { mapVentaFromApi, mapVentaToApi } from "../model/mappers";
import { api } from "@/shared/api/client";

class VentaService {
  async listVentas(filters?: VentaFilters): Promise<Venta[]> {
    const params = new URLSearchParams();
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.cliente) params.append('cliente', filters.cliente);
    if (filters?.id_cultivo) params.append('id_cultivo', filters.id_cultivo.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/ventas${query}`);
    return Array.isArray(data) ? data.map(mapVentaFromApi) : [];
  }

  async getVentaById(id: number): Promise<Venta> {
    const { data } = await api.get(`/ventas/${id}`);
    return mapVentaFromApi(data);
  }

  async createVenta(payload: CreateVentaDTO): Promise<Venta> {
    const { data } = await api.post("/ventas", mapVentaToApi(payload));
    return mapVentaFromApi(data);
  }

  async updateVenta(id: number, payload: CreateVentaDTO): Promise<Venta> {
    const { data } = await api.patch(`/ventas/${id}`, mapVentaToApi(payload));
    return mapVentaFromApi(data);
  }

  async removeVenta(id: number): Promise<boolean> {
    await api.delete(`/ventas/${id}`);
    return true;
  }
}

export const ventaService = new VentaService();