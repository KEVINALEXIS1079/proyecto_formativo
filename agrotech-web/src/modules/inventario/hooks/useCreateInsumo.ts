import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInsumo } from "../api/insumos.service";
import type { CreateInsumoInput } from "../model/types";
import { QK_INSUMOS_LIST } from "./useInsumoList";

export function useCreateInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInsumoInput) => createInsumo(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
    },
  });
}