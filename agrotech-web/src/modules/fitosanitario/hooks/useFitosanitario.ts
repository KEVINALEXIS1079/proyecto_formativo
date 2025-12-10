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
  EPA_LIST: (q: string, tipoId: number | undefined, tipoCultivoEpaId: number | undefined) =>
    ["epa", "list", { q, tipoId, tipoCultivoEpaId }] as const,
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
    queryKey: QK.EPA_LIST(q, tipoId, tipoCultivoEpaId),
    queryFn: async (): Promise<EpaListResp> => {
      const data = await epaService.list({
        q: q?.trim() || undefined,
        tipoId,
        tipoCultivoEpaId,
      });

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const items = data.slice(startIndex, endIndex);
      const total = data.length;
      const hasMore = endIndex < total;
      const nextOffset = endIndex;

      return {
        items,
        page,
        limit,
        total,
        hasMore,
        nextOffset,
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
  const { data: tiposEpa = [], isLoading: tiposEpaLoading, error: tiposEpaError } = useTipoEpaList();

  return useMutation({
    mutationFn: async (input: CreateEpaInput) => {
      console.log("=== HOOK useCreateEpa DEBUG ===");
      console.log("Input:", JSON.stringify(input, null, 2));
      console.log("Tipos EPA disponibles:", tiposEpa?.length || 0, tiposEpa);
      console.log("Tipos EPA loading:", tiposEpaLoading);
      console.log("Tipos EPA error:", tiposEpaError);

      // Si hay error cargando tipos EPA, intentar usar mapper básico
      if (tiposEpaError || (!tiposEpaLoading && (!tiposEpa || tiposEpa.length === 0))) {
        console.warn("Error o no tipos EPA cargados, usando mapper fallback");
        return epaService.create(input, []); // Forzar mapper fallback
      }

      return epaService.create(input, tiposEpa);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
    },
  });
}

export function useUpdateEpa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateEpaInput }) => {
      console.log("=== USE UPDATE EPA HOOK ===");
      console.log("ID:", id);
      console.log("Input:", JSON.stringify(input, null, 2));

      const result = await epaService.update(id, input);
      console.log("Update result:", result);
      return result;
    },
    onSuccess: async (data) => {
      console.log("=== UPDATE SUCCESS ===");
      console.log("Updated EPA:", data);

      // Forzar recarga completa invalidando todas las queries de EPA
      await qc.invalidateQueries({
        queryKey: QK.EPA_LIST_ROOT,
        exact: false,
        refetchType: 'active' // Solo refetch queries activas
      });

      // Invalidar queries individuales
      await qc.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'epa',
        refetchType: 'active'
      });

      console.log("Cache invalidated - forcing refetch");
    },
    onError: (error) => {
      console.error("=== UPDATE ERROR ===");
      console.error("Error:", error);
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