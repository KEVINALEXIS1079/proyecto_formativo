// src/modules/fitosanitario/hooks/useFitosanitario.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Epa,
  CreateEpaInput,
  UpdateEpaInput,
  TipoEpa,
  CreateTipoEpaInput,
  UpdateTipoEpaInput,
  TipoCultivoEpa,
  CreateTipoCultivoEpaInput,
  UpdateTipoCultivoEpaInput,
} from "../models/types";
import { epaService } from "../api/epa.service";
import { tipoEpaService } from "../api/tipoEpa.service";
import { tipoCultivoEpaService } from "../api/tipoCultivoEpa.service";

// =========================
// Query Keys (prefijos)
// =========================
export const QK = {
  EPA_LIST_ROOT: ["epa", "list"] as const,
  EPA_LIST: (q: string, tipoId: number | undefined, tipoCultivoEpaId: number | undefined, page: number, limit: number) =>
    ["epa", "list", { q, tipoId, tipoCultivoEpaId, page, limit }] as const,
  EPA_BY_ID: (id: number) => ["epa", "byId", id] as const,
  TIPO_EPA_LIST: ["tipo-epa", "list"] as const,
  TIPO_CULTIVO_EPA_LIST: ["tipo-cultivo-epa", "list"] as const,
};

// =========================
// EPA Hooks
// =========================

type EpaListParams = {
  q?: string;
  tipoId?: number;
  tipoCultivoEpaId?: number;
  page?: number;
  limit?: number;
};

type EpaListResp = {
  items: Epa[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

export function useEpaList({
  q = "",
  tipoId,
  tipoCultivoEpaId,
  page = 1,
  limit = 10,
}: EpaListParams = {}) {
  return useQuery<EpaListResp, unknown, EpaListResp>({
    queryKey: QK.EPA_LIST(q, tipoId, tipoCultivoEpaId, page, limit),
    queryFn: async (): Promise<EpaListResp> => {
      const resp = await epaService.list({
        q: q?.trim() || undefined,
        tipoId,
        tipoCultivoEpaId,
        page,
        limit,
      });

      // Asumimos que el backend devuelve array plano, normalizamos a paginado
      const arr: Epa[] = Array.isArray(resp) ? resp : [];
      const start = (page - 1) * limit;
      const paged = arr.slice(start, start + limit);
      return {
        items: paged,
        page,
        limit,
        total: arr.length,
        hasMore: start + limit < arr.length,
        nextOffset: start + limit,
      };
    },
    staleTime: 15_000,
  });
}

export function useEpaById(id: number) {
  return useQuery<Epa>({
    queryKey: QK.EPA_BY_ID(id),
    queryFn: () => epaService.getById(id),
    staleTime: 30_000,
  });
}

export function useCreateEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEpaInput) => epaService.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
    },
  });
}

export function useUpdateEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEpaInput }) =>
      epaService.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
    },
  });
}

export function useRemoveEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => epaService.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
    },
  });
}

// =========================
// Tipo EPA Hooks
// =========================

export function useTipoEpaList() {
  return useQuery<TipoEpa[]>({
    queryKey: QK.TIPO_EPA_LIST,
    queryFn: () => tipoEpaService.list(),
    staleTime: 30_000,
  });
}

export function useCreateTipoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTipoEpaInput) => tipoEpaService.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_EPA_LIST });
    },
  });
}

export function useUpdateTipoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTipoEpaInput }) =>
      tipoEpaService.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_EPA_LIST });
    },
  });
}

export function useRemoveTipoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tipoEpaService.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_EPA_LIST });
    },
  });
}

// =========================
// Tipo Cultivo EPA Hooks
// =========================

export function useTipoCultivoEpaList() {
  return useQuery<TipoCultivoEpa[]>({
    queryKey: QK.TIPO_CULTIVO_EPA_LIST,
    queryFn: () => tipoCultivoEpaService.list(),
    staleTime: 30_000,
  });
}

export function useCreateTipoCultivoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTipoCultivoEpaInput) => tipoCultivoEpaService.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVO_EPA_LIST });
    },
  });
}

export function useUpdateTipoCultivoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTipoCultivoEpaInput }) =>
      tipoCultivoEpaService.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVO_EPA_LIST });
    },
  });
}

export function useRemoveTipoCultivoEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tipoCultivoEpaService.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVO_EPA_LIST });
    },
  });
}