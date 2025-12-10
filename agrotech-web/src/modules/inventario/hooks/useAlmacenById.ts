import { useQuery } from "@tanstack/react-query";
import { getAlmacen } from "../api/almacenes.service";

export const QK_ALMACEN_BY_ID = ["inventario", "almacen"] as const;

export function useAlmacenById(id: number) {
  console.log('DEBUG: useAlmacenById called with id:', id);
  return useQuery({
    queryKey: [...QK_ALMACEN_BY_ID, id],
    queryFn: () => {
      console.log('DEBUG: Fetching almacen with id:', id);
      return getAlmacen(id);
    },
    enabled: !!id,
    staleTime: 15_000,
    onError: (error) => {
      console.error('DEBUG: Error fetching almacen with id:', id, error);
    },
  });
}