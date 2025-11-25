import { useQuery } from "@tanstack/react-query";
import { listCategoriasInsumo } from "../api/categorias-insumo.service";

export const QK_CATEGORIAS_LIST = ["inventario", "categorias", "list"] as const;

export function useCategoriaInsumoList(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: [...QK_CATEGORIAS_LIST, params],
    queryFn: () => listCategoriasInsumo(params),
    staleTime: 15_000,
  });
}