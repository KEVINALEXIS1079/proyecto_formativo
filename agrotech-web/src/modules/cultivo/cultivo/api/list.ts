import type { Cultivo } from "../model/types";
import api from "@/shared/api/client";

export async function getCultivos(): Promise<Cultivo[]> {
  const { data } = await api.get<Cultivo[]>("/cultivos");
  return data;
}
