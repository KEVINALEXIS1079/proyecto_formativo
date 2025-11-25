import { useQuery } from "@tanstack/react-query";
import { listMovimientos } from "../api/movimientos.service";

export const QK_MOVIMIENTOS_LIST = ["inventario", "movimientos", "list"] as const;

export function useMovimientoList(params?: { page?: number; limit?: number; q?: string; idInsumo?: number }) {
  return useQuery({
    queryKey: [...QK_MOVIMIENTOS_LIST, params],
    queryFn: () => listMovimientos(params),
    staleTime: 15_000,
  });
}