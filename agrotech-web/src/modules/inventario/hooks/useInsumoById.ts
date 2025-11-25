import { useQuery } from "@tanstack/react-query";
import { getInsumo } from "../api/insumos.service";

export const QK_INSUMO_BY_ID = ["inventario", "insumo"] as const;

export function useInsumoById(id: number) {
  return useQuery({
    queryKey: [...QK_INSUMO_BY_ID, id],
    queryFn: () => getInsumo(id),
    enabled: !!id,
    staleTime: 15_000,
  });
}