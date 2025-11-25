import type { CultivoPayload } from "./create";
import api from "@/shared/api/client";

export async function updateCultivo(id: number, payload: CultivoPayload): Promise<string> {
  const { data } = await api.patch<string>(`/cultivos/${id}`, payload);
  return data;
}
