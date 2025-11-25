import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTipoCultivoInput, UpdateTipoCultivoInput } from "../model/types";
import {
  listTiposCultivo as svcListTiposCultivo,
  getTipoCultivo as svcGetTipoCultivo,
  createTipoCultivo as svcCreateTipoCultivo,
  updateTipoCultivo as svcUpdateTipoCultivo,
  removeTipoCultivo as svcRemoveTipoCultivo,
} from "../api/tipos-cultivo.service";

export const QK_TIPOS_CULTIVO = {
  LIST_ROOT: ["tipos-cultivo", "list"] as const,
  LIST: (q: string, page: number, limit: number) => ["tipos-cultivo", "list", { q, page, limit }] as const,
  DETAIL: (id: number) => ["tipos-cultivo", "detail", id] as const,
};

export function useTiposCultivoList({
  page = 1,
  limit = 10,
  q = "",
}: {
  page?: number;
  limit?: number;
  q?: string;
} = {}) {
  return useQuery({
    queryKey: QK_TIPOS_CULTIVO.LIST(q, page, limit),
    queryFn: () => svcListTiposCultivo({ page, limit, q: q?.trim() || undefined }),
    staleTime: 15_000,
  });
}

export function useTipoCultivoDetail(id: number) {
  return useQuery({
    queryKey: QK_TIPOS_CULTIVO.DETAIL(id),
    queryFn: () => svcGetTipoCultivo(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useTipoCultivoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTipoCultivoInput) => svcCreateTipoCultivo(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_TIPOS_CULTIVO.LIST_ROOT });
    },
  });
}

export function useTipoCultivoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTipoCultivoInput }) => svcUpdateTipoCultivo(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_TIPOS_CULTIVO.LIST_ROOT });
      qc.invalidateQueries({ queryKey: QK_TIPOS_CULTIVO.DETAIL(id) });
    },
  });
}

export function useTipoCultivoRemove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svcRemoveTipoCultivo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_TIPOS_CULTIVO.LIST_ROOT });
    },
  });
}