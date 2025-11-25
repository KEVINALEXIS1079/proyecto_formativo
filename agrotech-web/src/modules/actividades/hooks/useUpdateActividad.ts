import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActividad } from "../api/actividades.service";
import type { UpdateActividadInput } from "../model/types";
import { QK_ACTIVIDADES_LIST } from "./useActividadList";
import { QK_ACTIVIDAD_BY_ID } from "./useActividadById";

export function useUpdateActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateActividadInput }) => updateActividad(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES_LIST });
      qc.invalidateQueries({ queryKey: [...QK_ACTIVIDAD_BY_ID, id] });
    },
  });
}