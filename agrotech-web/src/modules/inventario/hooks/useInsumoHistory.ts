import { useQuery } from "@tanstack/react-query";
import { getInsumoHistory, getAllInsumoHistory } from "../api/insumos.service";

export const QK_INSUMO_HISTORY = ["inventario", "insumo", "history"] as const;
export const QK_ALL_INSUMO_HISTORY = ["inventario", "insumo", "history", "all"] as const;

export function useInsumoHistory(id: number) {
  console.log('useInsumoHistory called with id:', id);
  return useQuery({
    queryKey: [...QK_INSUMO_HISTORY, id],
    queryFn: async () => {
      console.log('Fetching history for id:', id);
      const result = await getInsumoHistory(id);
      console.log('History result:', result);
      return result;
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useAllInsumoHistory() {
  console.log('useAllInsumoHistory called');
  return useQuery({
    queryKey: QK_ALL_INSUMO_HISTORY,
    queryFn: async () => {
      console.log('Fetching all history');
      const result = await getAllInsumoHistory();
      console.log('All history result:', result);
      return result;
    },
    staleTime: 15_000,
  });
}