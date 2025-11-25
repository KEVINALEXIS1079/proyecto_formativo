import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateActividadInput, UpdateActividadInput } from "../model/types";
import {
  listActividades as svcListActividades,
  getActividad as svcGetActividad,
  createActividad as svcCreateActividad,
  updateActividad as svcUpdateActividad,
  removeActividad as svcRemoveActividad,
} from "../api/actividades.service";

export const QK_ACTIVIDADES = {
  LIST_ROOT: ["actividades", "list"] as const,
  LIST: (q: string, tipoActividadId: number | undefined, page: number, limit: number) =>
    ["actividades", "list", { q, tipoActividadId, page, limit }] as const,
  DETAIL: (id: number) => ["actividades", "detail", id] as const,
};

export function useActividadesList({
  page = 1,
  limit = 10,
  q = "",
  tipoActividadId,
}: {
  page?: number;
  limit?: number;
  q?: string;
  tipoActividadId?: number;
} = {}) {
  return useQuery({
    queryKey: QK_ACTIVIDADES.LIST(q, tipoActividadId, page, limit),
    queryFn: () => svcListActividades({ page, limit, q: q?.trim() || undefined, tipoActividadId }),
    staleTime: 15_000,
  });
}

export function useActividadDetail(id: number) {
  return useQuery({
    queryKey: QK_ACTIVIDADES.DETAIL(id),
    queryFn: () => svcGetActividad(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useActividadCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateActividadInput) => svcCreateActividad(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES.LIST_ROOT });
    },
  });
}

export function useActividadUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateActividadInput }) => svcUpdateActividad(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES.LIST_ROOT });
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES.DETAIL(id) });
    },
  });
}

export function useActividadRemove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svcRemoveActividad(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDADES.LIST_ROOT });
    },
  });
}