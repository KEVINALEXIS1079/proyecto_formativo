import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeInsumo } from "../api/insumos.service";
import type { RemoveInsumoInput } from "../model/types";
import { QK_INSUMOS_LIST } from "./useInsumoList";

export function useRemoveInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RemoveInsumoInput }) => removeInsumo(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
    },
  });
}