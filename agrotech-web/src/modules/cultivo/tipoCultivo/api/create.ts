
import api from "@/shared/api/client";

export interface TipoCultivoPayload {
  nombre_tipo_cultivo: string;
}

export async function createTipoCultivo(payload: TipoCultivoPayload): Promise<string> {
  const { data } = await api.post<string>("/tipo-cultivo", payload);
  return data;
}
