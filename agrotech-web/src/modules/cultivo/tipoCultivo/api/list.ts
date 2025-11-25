import type { TipoCultivo } from "../model/types";
import api from "@/shared/api/client";

export async function getTiposCultivo(): Promise<TipoCultivo[]> {
  const { data } = await api.get<TipoCultivo[]>("/tipo-cultivo");
  return data;
}
