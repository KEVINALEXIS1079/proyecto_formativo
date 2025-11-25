import type { ReporteCostosRentabilidad, ReporteFilters } from "../model/types";
import { mapReporteFromApi } from "../model/mappers";
import { api } from "@/shared/api/client";

class ReportesService {
  async getCostosRentabilidad(filters?: ReporteFilters): Promise<ReporteCostosRentabilidad> {
    const params = new URLSearchParams();
    if (filters?.id_cultivo) params.append('id_cultivo', filters.id_cultivo.toString());
    if (filters?.id_lote) params.append('id_lote', filters.id_lote.toString());
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/reportes/costos-rentabilidad${query}`);
    return mapReporteFromApi(data);
  }
}

export const reportesService = new ReportesService();