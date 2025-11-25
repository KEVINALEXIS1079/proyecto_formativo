import type { Cultivo } from "../model/types";
import api from "@/shared/api/client";

export async function getCultivoById(id: number): Promise<Cultivo> {
  const { data } = await api.get<Cultivo>(`/cultivos/${id}`);
  return data;
}
