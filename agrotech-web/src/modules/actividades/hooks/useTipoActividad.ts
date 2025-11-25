import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTipoActividadInput } from "../model/types";
import {
  listTipoActividad as svcListTipoActividad,
  getTipoActividad as svcGetTipoActividad,
  createTipoActividad as svcCreateTipoActividad,
} from "../api/tipo-actividad.service";

export const QK_TIPO_ACTIVIDAD = {
  LIST: ["tipo-actividad", "list"] as const,
  DETAIL: (id: number) => ["tipo-actividad", "detail", id] as const,
};

export function useTipoActividadList() {
  return useQuery({
    queryKey: QK_TIPO_ACTIVIDAD.LIST,
    queryFn: () => svcListTipoActividad(),
    staleTime: 15_000,
  });
}

export function useTipoActividadDetail(id: number) {
  return useQuery({
    queryKey: QK_TIPO_ACTIVIDAD.DETAIL(id),
    queryFn: () => svcGetTipoActividad(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useTipoActividadCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTipoActividadInput) => svcCreateTipoActividad(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_TIPO_ACTIVIDAD.LIST });
    },
  });
}