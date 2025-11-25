import type { TipoCultivoPayload } from "./create";
import api from "@/shared/api/client";

export async function updateTipoCultivo(id: number, payload: TipoCultivoPayload): Promise<string> {
  const { data } = await api.patch<string>(`/tipo-cultivo/${id}`, payload);
  return data;
}
