import type { Lote, CreateLoteDTO } from "./types";

/**
 * Mapea un lote que viene del backend al formato del frontend
 */
export function mapLoteFromApi(data: any): Lote {
  let coords: { latitud_lote: number; longitud_lote: number }[] = [];

  let geom = data.geom;
  if (typeof geom === 'string') {
    try {
      geom = JSON.parse(geom);
    } catch (e) {
      console.error("Error parsing geom:", e);
      geom = null;
    }
  }

  if (geom && geom.coordinates && Array.isArray(geom.coordinates[0])) {
    coords = geom.coordinates[0].map((c: number[]) => ({
      latitud_lote: c[1],
      longitud_lote: c[0],
    }));
    // Remove the last point if it duplicates the first (closed polygon)
    if (coords.length > 0) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first.latitud_lote === last.latitud_lote && first.longitud_lote === last.longitud_lote) {
            coords.pop();
        }
    }
  } else if (Array.isArray(data.coordenadas_lote)) {
      // Fallback for legacy format
      coords = data.coordenadas_lote.map((c: any) => ({
          latitud_lote: Number(c.latitud_lote),
          longitud_lote: Number(c.longitud_lote),
      }));
  }

  return {
    id_lote_pk: Number(data.id ?? data.id_lote_pk ?? 0),
    nombre_lote: data.nombre ?? data.nombre_lote ?? "Sin Nombre",
    area_lote: Number(data.areaM2 ?? data.area_lote ?? 0),
    coordenadas_lote: coords,
    // Keep sublotes as-is, will be mapped in geo.service
    sublotes: data.sublotes || [], 
    delete_at: data.deletedAt ?? data.delete_at ?? null,
  };
}

/**
 * Mapea un lote desde el frontend al formato que espera el backend
 */
export function mapLoteToApi(lote: CreateLoteDTO) {
  const coords = Array.isArray(lote.coordenadas_lote)
    ? lote.coordenadas_lote.map((c) => [c.longitud_lote, c.latitud_lote])
    : [];

  // Ensure polygon is closed
  if (coords.length > 0) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }
  }

  return {
    nombre: lote.nombre_lote,
    descripcion: `Área aproximada: ${lote.area_lote} m²`,
    geom: {
      type: "Polygon",
      coordinates: [coords],
    },
  };
}
