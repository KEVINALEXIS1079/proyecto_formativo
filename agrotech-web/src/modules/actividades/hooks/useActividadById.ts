import { useQuery } from "@tanstack/react-query";
import { getActividad } from "../api/actividades.service";

export const QK_ACTIVIDAD_BY_ID = ["actividades", "actividad"] as const;

export function useActividadById(id: number) {
  return useQuery({
    queryKey: [...QK_ACTIVIDAD_BY_ID, id],
    queryFn: () => getActividad(id),
    enabled: !!id,
    staleTime: 15_000,
  });
}