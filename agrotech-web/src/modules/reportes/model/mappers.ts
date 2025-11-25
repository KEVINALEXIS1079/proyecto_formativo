/* mappers DTO <-> tipos UI */

import type { ReporteCostosRentabilidad } from "./types";

/**
 * Mapea un reporte de costos y rentabilidad que viene del backend al formato del frontend
 */
export function mapReporteFromApi(data: any): ReporteCostosRentabilidad {
  return {
    costo_insumos: Number(data.costo_insumos ?? 0),
    costo_mano_obra: Number(data.costo_mano_obra ?? 0),
    costo_maquinaria: Number(data.costo_maquinaria ?? 0),
    ingresos_ventas: Number(data.ingresos_ventas ?? 0),
    utilidad: Number(data.utilidad ?? 0),
    id_cultivo: data.id_cultivo ?? undefined,
    id_lote: data.id_lote ?? undefined,
    fecha_desde: data.fecha_desde ?? undefined,
    fecha_hasta: data.fecha_hasta ?? undefined,
  };
}