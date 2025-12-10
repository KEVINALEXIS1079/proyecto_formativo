import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMovimiento } from "../api/movimientos.service";
import type { UpdateMovimientoInput } from "../model/types";
import { QK_MOVIMIENTOS_LIST } from "./useMovimientoList";
import { QK_MOVIMIENTO_BY_ID } from "./useMovimientoById";

export function useUpdateMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMovimientoInput }) => updateMovimiento(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_MOVIMIENTOS_LIST });
      qc.invalidateQueries({ queryKey: [...QK_MOVIMIENTO_BY_ID, id] });
    },
  });
}