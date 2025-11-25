import type { Sublote } from "../../sublote/model/types";

export interface Lote {
  id_lote_pk: number;
  nombre_lote: string;
  area_lote: number;
  coordenadas_lote: { latitud_lote: number; longitud_lote: number }[];
  sublotes: Sublote[];
  delete_at: string | null;
}

export interface CreateLoteDTO {
  nombre_lote: string;
  coordenadas_lote: { latitud_lote: number; longitud_lote: number }[];
  area_lote?: number;
}

export interface Coordenada {
  latitud: number;
  longitud: number;
}
