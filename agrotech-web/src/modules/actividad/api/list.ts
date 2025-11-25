import api from "@/shared/api/client";
import type { Actividad } from "../model/types";

export async function listActividad(): Promise<Actividad[]> {
  const { data } = await api.get("/actividades");
  return data;
}
