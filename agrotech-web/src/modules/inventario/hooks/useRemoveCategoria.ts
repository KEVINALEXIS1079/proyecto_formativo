import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCategoriaInsumo } from "../api/categorias-insumo.service";
import { QK_CATEGORIAS_LIST } from "./useCategoriaInsumoList";

export function useRemoveCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCategoriaInsumo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CATEGORIAS_LIST });
    },
  });
}