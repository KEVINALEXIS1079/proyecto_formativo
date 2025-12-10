import api from "@/shared/api/client";

export async function updateActividad(id: number, payload: any): Promise<string> {
  const { data } = await api.patch(`/activities/${id}`, payload);
  return data;
}
