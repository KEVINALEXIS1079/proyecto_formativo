import type { TipoCultivo, Cultivo, Lote, Sublote } from './types';

export function adaptTipoCultivo(raw: any): TipoCultivo {
  return {
    id: raw?.id ?? raw?.id_tipo_cultivo_pk,
    nombre: raw?.nombre ?? raw?.nombre_tipo_cultivo ?? raw ?? "",
    descripcion: raw?.descripcion ?? "",
  };
}

// Helper to extract coordinates from GeoJSON Polygon
function parseGeoJSONCoords(geojson: any, isSublote = false): any[] {
  if (!geojson) return [];
  const geometry = typeof geojson === 'string' ? JSON.parse(geojson) : geojson;

  // Support both Polygon and MultiPolygon (take first polygon)
  const coordinates = geometry.coordinates;
  if (!coordinates || !Array.isArray(coordinates)) return [];

  // Assuming Polygon: coordinates is [ [ [lng, lat], ... ] ]
  // If MultiPolygon: [ [ [ [lng, lat], ... ] ] ]
  const ring = geometry.type === 'MultiPolygon' ? coordinates[0][0] : coordinates[0];

  if (!Array.isArray(ring)) return [];

  return ring.map((pt: any) => ({
    [isSublote ? 'latitud_sublote' : 'latitud_lote']: pt[1],
    [isSublote ? 'longitud_sublote' : 'longitud_lote']: pt[0]
  }));
}

export function adaptLote(raw: any): Lote {
  return {
    id: raw?.id ?? raw?.id_lote_pk ?? raw?.idLote,
    nombre: raw?.nombre ?? raw?.nombre_lote ?? "",
    descripcion: raw?.descripcion ?? "",
    area_lote: Number(raw?.areaM2 ?? raw?.area_lote ?? 0),
    // Parse geom to coordinates
    coordenadas_lote: parseGeoJSONCoords(raw?.geom ?? raw?.coordenadas, false),
    sublotes: Array.isArray(raw?.sublotes) ? raw.sublotes.map(adaptSublote) : [],
  };
}

export function adaptSublote(raw: any): Sublote {
  return {
    id: raw?.id ?? raw?.id_sublote_pk ?? raw?.idSublote,
    nombre: raw?.nombre ?? raw?.nombre_sublote ?? "",
    idLote: raw?.loteId ?? raw?.id_lote_fk ?? raw?.idLote ?? raw?.lote_id,
    descripcion: raw?.descripcion ?? "",
    area_sublote: Number(raw?.areaM2 ?? raw?.area_sublote ?? 0),
    coordenadas_sublote: parseGeoJSONCoords(raw?.geom ?? raw?.coordenadas, true),
  };
}

export function adaptCultivo(raw: any): Cultivo {
  const tipoNombre = raw?.tipoCultivo ?? raw?.tipo_cultivo ?? raw?.tipo;
  const tipo =
    raw?.tipoCultivo && typeof raw.tipoCultivo === "object"
      ? adaptTipoCultivo(raw.tipoCultivo)
      : raw?.subLote?.tipoCultivo && typeof raw.subLote.tipoCultivo === "object"
        ? adaptTipoCultivo(raw.subLote.tipoCultivo)
        : { id: raw?.id_tipo_cultivo_fk ?? 0, nombre: tipoNombre ?? "" };

  const subRaw = raw?.sublote ?? raw?.subLote;
  const sublote = subRaw ? adaptSublote(subRaw) : undefined;
  const lote = raw?.lote ? adaptLote(raw.lote) : subRaw?.lote ? adaptLote(subRaw.lote) : undefined;
  const toFullUrl = (path?: string) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    const base = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  };

  return {
    id: raw?.id ?? raw?.id_cultivo_pk,
    nombre: raw?.nombreCultivo ?? raw?.nombre_cultivo ?? raw?.nombre ?? "",
    descripcion: raw?.descripcion ?? raw?.descripcion_cultivo ?? "",
    idTipoCultivo: raw?.id_tipo_cultivo_fk ?? tipo.id,
    tipoCultivo: tipoNombre ? tipoNombre : tipo,
    idLote: raw?.loteId ?? raw?.lote_id ?? sublote?.idLote ?? undefined,
    lote,
    idSublote: raw?.subLoteId ?? raw?.sublote_id ?? raw?.id_sublote_fk ?? sublote?.id ?? undefined,
    sublote,
    estado: raw?.estado ?? raw?.estado_cultivo ?? "activo",
    fechaInicio: raw?.fechaInicio ?? raw?.fecha_inicio_cultivo ?? raw?.createdAt,
    fechaSiembra: raw?.fechaSiembra ?? raw?.fecha_siembra_cultivo,
    fechaFin: raw?.fechaFin ?? raw?.fecha_fin_cultivo ?? raw?.fechaFinalizacion,
    costoTotal: raw?.costo_total ?? raw?.costoTotal,
    ingresoTotal: raw?.ingreso_total ?? raw?.ingresoTotal,
    imagen: raw?.img_cultivo
      ? toFullUrl(raw.img_cultivo)
      : raw?.imgCultivo
        ? toFullUrl(raw.imgCultivo)
        : raw?.imagen || undefined,
  };
}
