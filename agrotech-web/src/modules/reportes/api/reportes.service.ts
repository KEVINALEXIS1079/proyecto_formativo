import type { ReporteCostosRentabilidad, ReporteFilters, ReporteCompleto } from "../model/types";
import { api } from "@/shared/api/client";

class ReportesService {
  async getCostosRentabilidad(filters?: ReporteFilters): Promise<ReporteCostosRentabilidad> {
    // Mock data with realistic values
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: ReporteCostosRentabilidad = {
      costo_insumos: 2950000,
      costo_mano_obra: 2400000,
      costo_maquinaria: 1200000,
      ingresos_ventas: 15700000,
      utilidad: 0,
    };

    const costoTotal = mockData.costo_insumos + mockData.costo_mano_obra + mockData.costo_maquinaria;
    mockData.utilidad = mockData.ingresos_ventas - costoTotal;

    return mockData;
  }

  async getReporteCompleto(filters?: ReporteFilters): Promise<ReporteCompleto> {
    // Construir parámetros de query
    const params = new URLSearchParams();
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

    // cultivoId es requerido
    if (!filters?.cultivoId) {
      throw new Error('cultivoId es requerido para generar el reporte');
    }

    // Llamar al endpoint real del backend
    const response = await api.get(
      `/reports/crops/${filters.cultivoId}/complete?${params.toString()}`
    );

    return response.data;
  }
}

export const reportesService = new ReportesService();