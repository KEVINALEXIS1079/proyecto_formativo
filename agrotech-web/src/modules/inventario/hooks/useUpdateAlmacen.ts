import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAlmacen } from "../api/almacenes.service";
import type { UpdateAlmacenInput } from "../model/types";
import { QK_ALMACENES_LIST } from "./useAlmacenList";
import { QK_ALMACEN_BY_ID } from "./useAlmacenById";

export function useUpdateAlmacen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAlmacenInput }) => updateAlmacen(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_ALMACENES_LIST });
      qc.invalidateQueries({ queryKey: [...QK_ALMACEN_BY_ID, id] });
    },
  });
}