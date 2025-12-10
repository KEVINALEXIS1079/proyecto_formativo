export type EstadoCultivo = 'activo' | 'inactivo' | 'finalizado';

export interface TipoCultivo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Lote {
  id: number;
  nombre: string;
  descripcion?: string;
  id_lote_pk?: number;
  nombre_lote?: string;
  area_lote?: number;
  coordenadas_lote?: { latitud_lote: number; longitud_lote: number }[];
  sublotes?: Sublote[];
}

export interface Sublote {
  id: number;
  nombre: string;
  idLote: number;
  descripcion?: string;
  id_sublote_pk?: number;
  nombre_sublote?: string;
  area_sublote?: number;
  coordenadas_sublote?: { latitud_sublote: number; longitud_sublote: number }[];
  id_lote_fk?: number;
}

export interface Cultivo {
  id: number;
  nombre: string;
  descripcion?: string;
  idTipoCultivo?: number;
  tipoCultivo: TipoCultivo | string;
  idLote?: number;
  lote?: Lote;
  idSublote?: number;
  sublote?: Sublote;
  estado: EstadoCultivo;
  fechaInicio: string;
  fechaSiembra?: string;
  fechaFin?: string;
  costoTotal?: number;
  ingresoTotal?: number;
  imagen?: string;
}

export interface CreateCultivoInput {
  nombre: string;
  descripcion?: string;
  idTipoCultivo?: number;
  tipoCultivo?: string;
  idLote?: number;
  idSublote?: number;
  img?: File | null;
  estado?: EstadoCultivo;
}

export interface UpdateCultivoInput extends Partial<CreateCultivoInput> {
  estado?: EstadoCultivo;
  motivo: string;
}

export interface CreateTipoCultivoInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateTipoCultivoInput extends Partial<CreateTipoCultivoInput> { }

export interface CreateLoteDTO {
  nombre: string; // Changed from nombre_lote
  descripcion?: string;
  geom: { type: string; coordinates: any[] }; // GeoJSON
}

export interface UpdateLoteDTO extends Partial<CreateLoteDTO> { }

export interface CreateSubloteDTO {
  nombre_sublote: string;
  area_sublote: number;
  coordenadas_sublote: { latitud_sublote: number; longitud_sublote: number }[];
  id_lote_fk: number;
  descripcion?: string;
}

export interface UpdateSubloteDTO extends Partial<CreateSubloteDTO> { }

export interface CultivoHistorial {
  id: number;
  cultivoId: number;
  usuarioId: number;
  motivo: string;
  cambios: Record<string, { previo: any; nuevo: any }> | null;
  createdAt: string;
  cultivo?: Cultivo;
  usuario?: { id: number; nombre?: string; email?: string; username?: string };
}
