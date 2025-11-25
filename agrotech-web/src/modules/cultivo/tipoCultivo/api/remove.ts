import api from "@/shared/api/client";

export async function removeTipoCultivo(id: number): Promise<string> {
  const { data } = await api.delete<string>(`/tipo-cultivo/${id}`);
  return data;
}
