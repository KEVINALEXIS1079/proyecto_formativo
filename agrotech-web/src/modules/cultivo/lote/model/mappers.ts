import type { Lote, CreateLoteDTO } from "./types";

/**
 * Mapea un lote que viene del backend al formato del frontend
 */
export function mapLoteFromApi(data: any): Lote {
  return {
    id_lote_pk: data.id_lote_pk,
    nombre_lote: data.nombre_lote,
    area_lote: Number(data.area_lote ?? 0),
    coordenadas_lote: Array.isArray(data.coordenadas_lote)
      ? data.coordenadas_lote.map((c: any) => ({
          latitud_lote: Number(c.latitud_lote),
          longitud_lote: Number(c.longitud_lote),
        }))
      : [],
    sublotes: [], // ya no mapeamos sublotes aquí
    delete_at: data.delete_at ?? null,
  };
}

/**
 * Mapea un lote desde el frontend al formato que espera el backend
 */
export function mapLoteToApi(lote: CreateLoteDTO) {
  return {
    nombre_lote: lote.nombre_lote,
    coordenadas_lote: Array.isArray(lote.coordenadas_lote)
      ? lote.coordenadas_lote.map((c) => ({
          latitud_lote: c.latitud_lote,
          longitud_lote: c.longitud_lote,
        }))
      : [],
    area_lote: lote.area_lote ?? 0,
  };
}
