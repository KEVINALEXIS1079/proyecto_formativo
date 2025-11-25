import api from "@/shared/api/client";

export async function removeCultivo(id: number): Promise<string> {
  const { data } = await api.delete<string>(`/cultivos/${id}`);
  return data;
}
