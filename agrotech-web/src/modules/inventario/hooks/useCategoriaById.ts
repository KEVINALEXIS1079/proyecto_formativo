import { useQuery } from "@tanstack/react-query";
import { getCategoriaInsumo } from "../api/categorias-insumo.service";

export const QK_CATEGORIA_BY_ID = ["inventario", "categoria"] as const;

export function useCategoriaById(id: number) {
  return useQuery({
    queryKey: [...QK_CATEGORIA_BY_ID, id],
    queryFn: () => getCategoriaInsumo(id),
    enabled: !!id,
    staleTime: 15_000,
  });
}