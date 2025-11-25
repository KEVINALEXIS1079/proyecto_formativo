import api from "@/shared/api/client";
import type { Actividad } from "../model/types";

export async function getActividadById(id: number): Promise<Actividad> {
  const { data } = await api.get(`/actividades/${id}`);
  return data;
}
