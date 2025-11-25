import api from "@/shared/api/client";

export interface CultivoPayload {
  nombre_cultivo: string;
  descripcion_cultivo: string;
  img_cultivo?: string;
  estado_cultivo: string;
  fecha_inicio_cultivo: string;
  fecha_fin_cultivo?: string;
  id_sublote_fk: number;
  id_tipo_cultivo_fk: number;
}

export async function createCultivo(payload: CultivoPayload): Promise<{ id: number; nombre: string }> {
  const { data } = await api.post<{ id: number; nombre: string }>("/cultivos", payload);
  return data;
}
