import api from "@/shared/api/client";

export async function createActividad(payload: any): Promise<string> {
  const { data } = await api.post("/actividades", payload);
  return data;
}
