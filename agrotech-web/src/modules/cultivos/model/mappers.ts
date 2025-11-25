import type { TipoCultivo, Cultivo, Lote, Sublote } from './types';

export function adaptTipoCultivo(raw: any): TipoCultivo {
  return {
    id: raw.id_tipo_cultivo_pk,
    nombre: raw.nombre_tipo_cultivo,
    descripcion: raw.descripcion,
  };
}

export function adaptLote(raw: any): Lote {
  return {
    id: raw.id_lote_pk,
    nombre: raw.nombre_lote,
    descripcion: raw.descripcion,
  };
}

export function adaptSublote(raw: any): Sublote {
  return {
    id: raw.id_sublote_pk,
    nombre: raw.nombre_sublote,
    idLote: raw.id_lote_fk,
    descripcion: raw.descripcion,
  };
}

export function adaptCultivo(raw: any): Cultivo {
  return {
    id: raw.id_cultivo_pk,
    nombre: raw.nombre_cultivo,
    descripcion: raw.descripcion_cultivo,
    idTipoCultivo: raw.id_tipo_cultivo_fk,
    tipoCultivo: adaptTipoCultivo(raw.tipoCultivo),
    idLote: raw.sublote?.id_lote_fk,
    lote: raw.sublote?.lote ? adaptLote(raw.sublote.lote) : undefined,
    idSublote: raw.id_sublote_fk,
    sublote: raw.sublote ? adaptSublote(raw.sublote) : undefined,
    estado: raw.estado_cultivo,
    fechaInicio: raw.fecha_inicio_cultivo,
    fechaSiembra: raw.fecha_siembra_cultivo,
    fechaFin: raw.fecha_fin_cultivo,
    costoTotal: raw.costo_total,
    ingresoTotal: raw.ingreso_total,
    imagen: raw.img_cultivo ? `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${raw.img_cultivo}` : undefined,
  };
}