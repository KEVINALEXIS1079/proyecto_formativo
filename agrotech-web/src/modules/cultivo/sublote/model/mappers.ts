import type { Sublote, CreateSubloteDTO } from "./types";

/**
 * Mapea un sublote que viene del backend al formato del frontend
 */
export function mapSubloteFromApi(data: any): Sublote {
  return {
    id_sublote_pk: data.id_sublote_pk,
    nombre_sublote: data.nombre_sublote,
    area_sublote: Number(data.area_sublote ?? 0),
    coordenadas_sublote: Array.isArray(data.coordenadas_sublote)
      ? data.coordenadas_sublote
          .filter(
            (c: any) =>
              c &&
              typeof c.latitud_sublote === "number" &&
              typeof c.longitud_sublote === "number"
          )
          .map((c: any) => ({
            latitud_sublote: Number(c.latitud_sublote),
            longitud_sublote: Number(c.longitud_sublote),
          }))
      : [],
    lote: data.lote ?? null,
    cultivos: data.cultivos ?? [],
    delete_at: data.delete_at ?? null,
  };
}


/**
 * Mapea un sublote desde el frontend al formato que espera el backend
 */
export function mapSubloteToApi(sublote: CreateSubloteDTO) {
  return {
    nombre_sublote: sublote.nombre_sublote,
    id_lote_fk: sublote.id_lote_fk,
    area_sublote: sublote.area_sublote ?? 0,
    coordenadas_sublote: Array.isArray(sublote.coordenadas_sublote)
      ? sublote.coordenadas_sublote.map((c) => ({
          latitud_sublote: c.latitud_sublote,
          longitud_sublote: c.longitud_sublote,
        }))
      : [],
  };
}
