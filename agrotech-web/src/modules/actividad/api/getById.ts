import api from "@/shared/api/client";
import type { Actividad } from "../models/types";

export async function getActividadById(id: number): Promise<Actividad> {
  const { data } = await api.get(`/activities/${id}`);
  return data;
}
