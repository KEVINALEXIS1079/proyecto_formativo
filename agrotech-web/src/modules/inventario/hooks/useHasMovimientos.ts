import { useQuery } from "@tanstack/react-query";
import { hasMovimientos } from "../api/insumos.service";

export const QK_HAS_MOVIMIENTOS = ["inventario", "insumo", "hasMovimientos"] as const;

export function useHasMovimientos(id: number) {
  return useQuery({
    queryKey: [...QK_HAS_MOVIMIENTOS, id],
    queryFn: () => hasMovimientos(id),
    enabled: !!id,
    staleTime: 15_000,
  });
}