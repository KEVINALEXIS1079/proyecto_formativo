import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActividad } from "../api/actividades.service";
import type { CreateActividadInput } from "../model/types";
import { QK_ACTIVIDADES_LIST } from "./useActividadList";

export function useCreateActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateActividadInput) => createActividad(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES_LIST });
    },
  });
}