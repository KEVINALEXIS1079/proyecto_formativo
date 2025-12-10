import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMovimiento } from "../api/movimientos.service";
import { QK_MOVIMIENTOS_LIST } from "./useMovimientoList";

export function useRemoveMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeMovimiento(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_MOVIMIENTOS_LIST });
    },
  });
}