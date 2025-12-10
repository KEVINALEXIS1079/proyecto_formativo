import { useQuery } from "@tanstack/react-query";
import { listInsumos } from "../api/insumos.service";
import type { Insumo } from "../model/types";

export const QK_INSUMOS_LIST = ["inventario", "insumos", "list"] as const;

type InsumosListResp = {
  items: Insumo[];
  total: number;
  page: number;
  limit: number;
};

export function useInsumoList(params?: { page?: number; limit?: number; q?: string; categoriaId?: number; proveedorId?: number; almacenId?: number }) {
  const query = useQuery<InsumosListResp>({
    queryKey: [...QK_INSUMOS_LIST, params],
    queryFn: async () => {
      const data = await listInsumos(params);
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        };
      }
      return data as InsumosListResp;
    },
    staleTime: 15_000,
  });

  return {
    ...query,
    refetch: query.refetch,
  };
}