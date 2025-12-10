import { api } from "./client";

export type Lote = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  areaM2?: number | null;
};

export type SubLote = {
  id: number;
  nombre: string;
  loteId?: number | null;
  descripcion?: string | null;
};

function mapLote(data: any): Lote {
  return {
    id: Number(data?.id ?? data?.id_lote_pk ?? 0),
    nombre: data?.nombre ?? data?.nombre_lote ?? "Sin nombre",
    descripcion: data?.descripcion ?? null,
    areaM2: data?.areaM2 ?? data?.area_lote ?? null,
  };
}

function mapSubLote(data: any): SubLote {
  return {
    id: Number(data?.id ?? data?.id_sublote_pk ?? 0),
    nombre: data?.nombre ?? data?.nombre_sublote ?? "Sin nombre",
    loteId: data?.loteId ?? data?.id_lote_fk ?? data?.lote?.id ?? null,
    descripcion: data?.descripcion ?? null,
  };
}

export const GeoApi = {
  async getLotes(): Promise<Lote[]> {
    const { data } = await api.get("/geo/lotes");
    return Array.isArray(data) ? data.map(mapLote) : [];
  },

  async getSubLotes(loteId?: number): Promise<SubLote[]> {
    const { data } = await api.get("/geo/sublotes", {
      params: loteId ? { loteId } : {},
    });
    return Array.isArray(data) ? data.map(mapSubLote) : [];
  },
};

export default GeoApi;
