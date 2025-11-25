import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeActividad } from "../api/actividades.service";
import { QK_ACTIVIDADES_LIST } from "./useActividadList";
import { QK_ACTIVIDAD_BY_ID } from "./useActividadById";

export function useRemoveActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeActividad(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES_LIST });
      qc.invalidateQueries({ queryKey: [...QK_ACTIVIDAD_BY_ID, id] });
    },
  });
}