import type { Sublote, CreateSubloteDTO } from "./types";

/**
 * Mapea un sublote que viene del backend al formato del frontend
 */
export function mapSubloteFromApi(data: any): Sublote {
  console.log("📍 Mapping sublote from API:", JSON.stringify(data, null, 2));
  
  let coords: { latitud_sublote: number; longitud_sublote: number }[] = [];

  // Parse geom if it's a string
  let geom = data.geom;
  if (typeof geom === 'string') {
    try {
      geom = JSON.parse(geom);
    } catch (e) {
      console.error("Error parsing geom:", e);
      geom = null;
    }
  }

  // Extract coordinates from GeoJSON
  if (geom && geom.coordinates && Array.isArray(geom.coordinates[0])) {
    coords = geom.coordinates[0].map((c: number[]) => ({
      latitud_sublote: c[1],
      longitud_sublote: c[0],
    }));
    // Remove the last point if it duplicates the first (closed polygon)
    if (coords.length > 0) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first.latitud_sublote === last.latitud_sublote && first.longitud_sublote === last.longitud_sublote) {
        coords.pop();
      }
    }
  }

  const mapped = {
    id_sublote_pk: data.id ?? 0,
    nombre_sublote: data.nombre ?? "Sin Nombre",
    area_sublote: Number(data.areaM2 ?? 0),
    coordenadas_sublote: coords,
    lote: data.lote ?? null,
    cultivos: data.cultivos ?? [],
    delete_at: data.deletedAt ?? null,
  };

  console.log("📍 Mapped sublote:", JSON.stringify(mapped, null, 2));
  return mapped;
}


/**
 * Mapea un sublote desde el frontend al formato que espera el backend
 */
export function mapSubloteToApi(sublote: CreateSubloteDTO) {
  // Convert coordinates to GeoJSON format
  const coords = Array.isArray(sublote.coordenadas_sublote)
    ? sublote.coordenadas_sublote.map((c) => [c.longitud_sublote, c.latitud_sublote])
    : [];

  // Ensure polygon is closed
  if (coords.length > 0) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }
  }

  const payload = {
    loteId: sublote.id_lote_fk,
    nombre: sublote.nombre_sublote,
    descripcion: `Área aproximada: ${sublote.area_sublote} m²`,
    geom: {
      type: "Polygon",
      coordinates: [coords],
    },
  };

  console.log("Payload being sent to backend:", JSON.stringify(payload, null, 2));
  return payload;
}
