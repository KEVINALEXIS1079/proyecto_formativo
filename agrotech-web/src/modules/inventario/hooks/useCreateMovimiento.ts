import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovimiento } from "../api/movimientos.service";
import type { CreateMovimientoInput } from "../model/types";
import { QK_MOVIMIENTOS_LIST } from "./useMovimientoList";
import { QK_INSUMOS_LIST } from "./useInsumoList";

export function useCreateMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMovimientoInput) => createMovimiento(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_MOVIMIENTOS_LIST });
      qc.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
    },
  });
}