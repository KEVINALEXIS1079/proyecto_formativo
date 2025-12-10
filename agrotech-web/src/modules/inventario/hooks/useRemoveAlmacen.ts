import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAlmacen } from "../api/almacenes.service";
import { QK_ALMACENES_LIST } from "./useAlmacenList";

export function useRemoveAlmacen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeAlmacen(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ALMACENES_LIST });
    },
  });
}