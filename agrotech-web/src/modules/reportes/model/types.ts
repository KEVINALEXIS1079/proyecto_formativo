/* tipos UI del dominio */

export interface ReporteCostosRentabilidad {
  costo_insumos: number;
  costo_mano_obra: number;
  costo_maquinaria: number;
  ingresos_ventas: number;
  utilidad: number;
  // Campos adicionales si el backend los proporciona
  id_cultivo?: number;
  id_lote?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ReporteFilters {
  id_cultivo?: number;
  id_lote?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}