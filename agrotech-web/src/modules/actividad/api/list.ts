import api from "@/shared/api/client";
import type { Actividad } from "../models/types";

export async function listActividad(params?: { cultivoId?: number; loteId?: number; tipo?: string }): Promise<Actividad[]> {
  const { data } = await api.get("/activities", { params });
  return data;
}
