// src/modules/cultivo/tipoCultivo/hooks/useTipoCultivo.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TipoCultivo } from "../model/types";
import type { TipoCultivoPayload } from "../api/create";
import {
  getTiposCultivo as svcGetTiposCultivo,
  createTipoCultivo as svcCreateTipoCultivo,
  updateTipoCultivo as svcUpdateTipoCultivo,
  removeTipoCultivo as svcRemoveTipoCultivo,
} from "../api";

type TipoCultivoListResp = {
  data: TipoCultivo[];
};

// =========================
// Query Keys (prefijos)
// =========================
export const QK = {
  TIPO_CULTIVOS_LIST: ["tipo-cultivos", "list"] as const,
  TIPO_CULTIVO_BY_ID: (id: number) => ["tipo-cultivos", "byId", id] as const,
};

export function useTipoCultivoList() {
  return useQuery<TipoCultivoListResp, unknown, TipoCultivoListResp>({
    queryKey: QK.TIPO_CULTIVOS_LIST,
    queryFn: async (): Promise<TipoCultivoListResp> => {
      const data = await svcGetTiposCultivo();
      return { data };
    },
    staleTime: 15_000,
  });
}

export function useTipoCultivoById(id: number) {
  return useQuery<TipoCultivo>({
    queryKey: QK.TIPO_CULTIVO_BY_ID(id),
    queryFn: async (): Promise<TipoCultivo> => {
      // Assuming there's a getById, but since not present, maybe not needed for now
      throw new Error("Not implemented");
    },
    staleTime: 15_000,
  });
}

/* =========================
 * Mutaciones
 * ========================= */

export function useCreateTipoCultivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TipoCultivoPayload) => svcCreateTipoCultivo(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVOS_LIST });
    },
  });
}

export function useUpdateTipoCultivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TipoCultivoPayload }) =>
      svcUpdateTipoCultivo(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVOS_LIST });
    },
  });
}

export function useRemoveTipoCultivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svcRemoveTipoCultivo(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.TIPO_CULTIVOS_LIST });
    },
  });
}