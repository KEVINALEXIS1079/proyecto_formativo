import { useQuery } from "@tanstack/react-query";
import { listAlmacenes } from "../api/almacenes.service";

export const QK_ALMACENES_LIST = ["inventario", "almacenes", "list"] as const;

export function useAlmacenList(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: [...QK_ALMACENES_LIST, params],
    queryFn: () => listAlmacenes(params),
    staleTime: 15_000,
  });
}