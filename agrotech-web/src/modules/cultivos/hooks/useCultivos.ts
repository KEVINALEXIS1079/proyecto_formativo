import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCultivoInput, UpdateCultivoInput, CultivoHistorial } from "../model/types";
import {
  listCultivos as svcListCultivos,
  getCultivo as svcGetCultivo,
  createCultivo as svcCreateCultivo,
  updateCultivo as svcUpdateCultivo,
  listHistorial as svcListHistorial,
} from "../api/cultivos.service";

export const QK_CULTIVOS = {
  LIST_ROOT: ["cultivos", "list"] as const,
  LIST: (
    q: string,
    loteId: number | undefined,
    tipoCultivoNombre: string | undefined,
    estado: string | undefined,
    page: number,
    limit: number,
  ) => ["cultivos", "list", { q, loteId, tipoCultivoNombre, estado, page, limit }] as const,
  DETAIL: (id: number) => ["cultivos", "detail", id] as const,
  HISTORIAL: (limit?: number) => ["cultivos", "historial", limit ?? "default"] as const,
};

export function useCultivosList({
  page = 1,
  limit = 10,
  q = "",
  loteId,
  tipoCultivoNombre,
  estado,
}: {
  page?: number;
  limit?: number;
  q?: string;
  loteId?: number;
  tipoCultivoNombre?: string;
  estado?: string;
} = {}) {
  return useQuery({
    queryKey: QK_CULTIVOS.LIST(q, loteId, tipoCultivoNombre, estado, page, limit),
    queryFn: () =>
      svcListCultivos({
        page,
        limit,
        q: q?.trim() || undefined,
        loteId,
        tipoCultivo: tipoCultivoNombre,
        estado,
      }),
    staleTime: 15_000,
  });
}

export function useCultivoDetail(id: number) {
  return useQuery({
    queryKey: QK_CULTIVOS.DETAIL(id),
    queryFn: () => svcGetCultivo(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCultivoCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCultivoInput) => svcCreateCultivo(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CULTIVOS.LIST_ROOT });
    },
  });
}

export function useCultivoUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCultivoInput }) => svcUpdateCultivo(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_CULTIVOS.LIST_ROOT });
      qc.invalidateQueries({ queryKey: QK_CULTIVOS.DETAIL(id) });
    },
  });
}

export function useCultivoHistorial(params: { limit?: number; cultivoId?: number } = {}) {
  const { limit = 50, cultivoId } = params;
  return useQuery<CultivoHistorial[]>({
    queryKey: QK_CULTIVOS.HISTORIAL(limit),
    queryFn: () => svcListHistorial({ limit, cultivoId }),
    enabled: params.cultivoId !== undefined ? !!params.cultivoId : true,
    staleTime: 30_000,
  });
}
