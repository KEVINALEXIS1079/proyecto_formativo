export type EstadoCultivo = 'activo' | 'inactivo';

export interface TipoCultivo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Lote {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Sublote {
  id: number;
  nombre: string;
  idLote: number;
  descripcion?: string;
}

export interface Cultivo {
  id: number;
  nombre: string;
  descripcion?: string;
  idTipoCultivo: number;
  tipoCultivo: TipoCultivo;
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
  idTipoCultivo: number;
  idSublote?: number;
  img?: File | null;
}

export interface UpdateCultivoInput extends Partial<CreateCultivoInput> {
  estado?: EstadoCultivo;
}

export interface CreateTipoCultivoInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateTipoCultivoInput extends Partial<CreateTipoCultivoInput> {}