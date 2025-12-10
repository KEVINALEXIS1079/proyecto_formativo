// Enums
export enum TipoActividad {
  CREACION = 'CREACION',
  MANTENIMIENTO = 'MANTENIMIENTO',
  FINALIZACION = 'FINALIZACION',
}

export enum SubtipoActividad {
  SIEMBRA = 'SIEMBRA',
  RIEGO = 'RIEGO',
  FERTILIZACION = 'FERTILIZACION',
  CONTROL_PLAGAS = 'CONTROL_PLAGAS',
  PODA = 'PODA',
  COSECHA = 'COSECHA',
  FINALIZACION = 'FINALIZACION',
  OTRA = 'OTRA',
}

export enum EstadoActividad {
  PENDIENTE = 'Pendiente',
  FINALIZADA = 'Finalizada',
}

// Interfaces principales
export interface Activity {
  id: number;
  nombre: string;
  tipo: TipoActividad;
  subtipo: SubtipoActividad;
  loteId?: number;
  subLoteId?: number;
  cultivoId?: number;
  fecha: string;
  horasActividad: number;
  precioHoraActividad: number;
  costoManoObra: number;
  descripcion?: string;
  estado: string;
  creadoPorUsuarioId: number;
  lote?: { id: number; nombre: string };
  subLote?: { id: number; nombre: string };
  cultivo?: { id: number; nombre: string };
  responsables?: ActivityResponsable[];
  servicios?: ActivityServicio[];
  insumosUso?: ActivityInsumoUso[];
  evidencias?: ActivityEvidencia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityResponsable {
  id: number;
  actividadId: number;
  usuarioId: number;
  horas: number;
  precioHora: number;
  costo: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface ActivityInsumoUso {
  id: number;
  actividadId: number;
  insumoId: number;
  cantidadUso: number;
  costoUnitarioUso: number;
  costoTotal: number;
  insumo?: {
    id: number;
    nombre: string;
    unidad: string;
    cantidad: number;
  };
}

export interface ActivityServicio {
  id: number;
  actividadId: number;
  nombreServicio: string;
  horas: number;
  precioHora: number;
  costo: number;
}

export interface ActivityEvidencia {
  id: number;
  actividadId: number;
  descripcion?: string;
  imagenes: string[];
  createdAt?: string;
}

// DTOs
export interface CreateActivityDto {
  nombre: string;
  tipo: TipoActividad;
  subtipo: SubtipoActividad;
  cultivoId?: number;
  loteId?: number;
  subLoteId?: number;
  fecha: string;
  descripcion?: string;
  estado?: string;
  horasActividad?: number;
  precioHoraActividad?: number;
  costoManoObra?: number;
  responsables?: CreateActivityResponsableDto[];
  insumos?: CreateActivityInsumoDto[];
  servicios?: CreateActivityServicioDto[];
  evidencias?: CreateActivityEvidenciaDto[];
}

export interface UpdateActivityDto {
  nombre?: string;
  tipo?: TipoActividad;
  subtipo?: SubtipoActividad;
  cultivoId?: number;
  loteId?: number;
  subLoteId?: number;
  fecha?: string;
  descripcion?: string;
  estado?: string;
  horasActividad?: number;
  precioHoraActividad?: number;
  costoManoObra?: number;
}

export interface CreateActivityResponsableDto {
  usuarioId: number;
  horas?: number;
  precioHora?: number;
}

export interface CreateActivityInsumoDto {
  insumoId: number;
  cantidadUso: number;
  costoUnitarioUso: number;
  descripcion?: string;
}

export interface CreateActivityServicioDto {
  nombreServicio: string;
  horas: number;
  precioHora: number;
}

export interface CreateActivityEvidenciaDto {
  descripcion: string;
  imagenes: string[];
}

// Tipos auxiliares
export interface ActivityFilters {
  tipo?: TipoActividad;
  subtipo?: SubtipoActividad;
  estado?: string;
  search?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ActivityCostSummary {
  costoManoObra: number;
  costoInsumos: number;
  costoServicios: number;
  costoTotal: number;
}
