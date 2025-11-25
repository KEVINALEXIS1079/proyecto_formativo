import type { TipoCultivo } from "../model/types";
import api from "@/shared/api/client";

export async function getTipoCultivoById(id: number): Promise<TipoCultivo> {
  const { data } = await api.get<TipoCultivo>(`/tipo-cultivo/${id}`);
  return data;
}
