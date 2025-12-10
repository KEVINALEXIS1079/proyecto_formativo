import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategoriaInsumo } from "../api/categorias-insumo.service";
import { QK_CATEGORIAS_LIST } from "./useCategoriaInsumoList";

export function useUpdateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategoriaInsumo(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CATEGORIAS_LIST });
    },
  });
}