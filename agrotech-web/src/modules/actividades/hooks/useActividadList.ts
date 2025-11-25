import { useQuery } from "@tanstack/react-query";
import { listActividades } from "../api/actividades.service";
import type { Actividad } from "../model/types";

export const QK_ACTIVIDADES_LIST = ["actividades", "list"] as const;

type ActividadesListResp = {
  items: Actividad[];
  total: number;
  page: number;
  limit: number;
};

export function useActividadList(params?: { page?: number; limit?: number; q?: string; tipoActividadId?: number }) {
  return useQuery<ActividadesListResp>({
    queryKey: [...QK_ACTIVIDADES_LIST, params],
    queryFn: async () => {
      const data = await listActividades(params);
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        };
      }
      return data as ActividadesListResp;
    },
    staleTime: 15_000,
  });
}