import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInsumo } from "../api/insumos.service";
import type { UpdateInsumoInput } from "../model/types";
import { QK_INSUMOS_LIST } from "./useInsumoList";
import { QK_INSUMO_BY_ID } from "./useInsumoById";

export function useUpdateInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateInsumoInput }) => updateInsumo(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
      qc.invalidateQueries({ queryKey: [...QK_INSUMO_BY_ID, id] });
    },
  });
}