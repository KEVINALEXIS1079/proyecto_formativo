import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateActividadSubtipoInput } from "../model/types";
import {
  listActividadSubtipos as svcListActividadSubtipos,
  getActividadSubtipo as svcGetActividadSubtipo,
  updateActividadSubtipo as svcUpdateActividadSubtipo,
  removeActividadSubtipo as svcRemoveActividadSubtipo,
} from "../api/actividad-subtipos.service";

export const QK_ACTIVIDAD_SUBTIPOS = {
  LIST_ROOT: ["actividad-subtipos", "list"] as const,
  LIST: (q: string, tipoActividadId: number | undefined, page: number, limit: number) =>
    ["actividad-subtipos", "list", { q, tipoActividadId, page, limit }] as const,
  DETAIL: (id: number) => ["actividad-subtipos", "detail", id] as const,
};

export function useActividadSubtiposList({
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
    queryKey: QK_ACTIVIDAD_SUBTIPOS.LIST(q, tipoActividadId, page, limit),
    queryFn: () => svcListActividadSubtipos({ page, limit, q: q?.trim() || undefined, tipoActividadId }),
    staleTime: 15_000,
  });
}

export function useActividadSubtipoDetail(id: number) {
  return useQuery({
    queryKey: QK_ACTIVIDAD_SUBTIPOS.DETAIL(id),
    queryFn: () => svcGetActividadSubtipo(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}


export function useActividadSubtipoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateActividadSubtipoInput }) => svcUpdateActividadSubtipo(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDAD_SUBTIPOS.LIST_ROOT });
      qc.invalidateQueries({ queryKey: QK_ACTIVIDAD_SUBTIPOS.DETAIL(id) });
    },
  });
}

export function useActividadSubtipoRemove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svcRemoveActividadSubtipo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ACTIVIDAD_SUBTIPOS.LIST_ROOT });
    },
  });
}