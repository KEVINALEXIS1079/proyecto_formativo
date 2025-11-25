// ------------------------------
// Import del tipo Lote (para relación entre sublote y lote padre)
// ------------------------------
import type { Lote } from "../../lote/model/types";

// ------------------------------
// Estructura principal del sublote
// ------------------------------
export interface Sublote {
  id_sublote_pk: number; // ID principal del sublote
  nombre_sublote: string; // Nombre del sublote
  area_sublote: number; // Área calculada en m²

  // Coordenadas geográficas asociadas al sublote
  coordenadas_sublote: {
    latitud_sublote: number;
    longitud_sublote: number;
  }[];

  // Relación con el lote padre
  lote: Lote;

  // Relación con cultivos (si aplica)
  cultivos: any[];

  // Control de eliminación lógica
  delete_at: string | null;
}

// ------------------------------
// DTO para creación de sublotes
// ------------------------------
export interface CreateSubloteDTO {
  nombre_sublote: string;
  coordenadas_sublote: {
    latitud_sublote: number;
    longitud_sublote: number;
  }[];
  id_lote_fk: number;
  area_sublote?: number;
}

// ------------------------------
// DTO para actualización de sublotes
// ------------------------------
export interface UpdateSubloteDTO extends Partial<CreateSubloteDTO> {
  id_sublote_pk: number;
}
