import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoriaInsumo } from "../api/categorias-insumo.service";
import { QK_CATEGORIAS_LIST } from "./useCategoriaInsumoList";

export function useCreateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategoriaInsumo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CATEGORIAS_LIST });
    },
  });
}