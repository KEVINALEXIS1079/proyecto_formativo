import api from "@/shared/api/client";

export async function removeActividad(id: number): Promise<string> {
  const { data } = await api.delete(`/actividades/${id}`);
  return data;
}
