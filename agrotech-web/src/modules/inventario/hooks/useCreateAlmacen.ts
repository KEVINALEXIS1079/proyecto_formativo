import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlmacen } from "../api/almacenes.service";
import { QK_ALMACENES_LIST } from "./useAlmacenList";

export function useCreateAlmacen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAlmacen,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ALMACENES_LIST });
    },
  });
}