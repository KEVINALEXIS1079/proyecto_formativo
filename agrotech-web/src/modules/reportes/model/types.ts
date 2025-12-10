export interface ReporteCostosRentabilidad {
  costo_insumos: number;
  costo_mano_obra: number;
  costo_maquinaria: number;
  ingresos_ventas: number;
  utilidad: number;
  id_cultivo?: number;
  id_lote?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ReporteFilters {
  cultivoId?: number;
  loteId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ActividadReporte {
  id: number;
  nombre: string;
  fecha: string;
  tipo: string;
  responsable: string;
  horasTrabajadas: number;
  costoManoObra: number;
}

export interface InsumoReporte {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  total: number;
  categoria: string;
}

export interface VentaReporte {
  id: number;
  fecha: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  cliente: string;
}

export interface CosechaReporte {
  id: number;
  producto: string;
  fecha: string;
  cantidad: number;
  calidad: string;
  costoUnitario: number;
  costoTotal: number;
}

export interface ReporteCompleto {
  resumen: {
    costoTotal: number;
    ingresoTotal: number;
    utilidadNeta: number;
    relacionBC: number;
    roi: number;
    margenNeto: number;
  };
  costos: {
    insumos: number;
    manoObra: number;
    maquinaria: number;
    otros: number;
  };
  actividades: ActividadReporte[];
  insumos: InsumoReporte[];
  ventas: VentaReporte[];
  cosechas: CosechaReporte[];
  horasTrabajadas: {
    total: number;
    porActividad: Array<{
      actividad: string;
      horas: number;
      costo: number;
    }>;
  };
}