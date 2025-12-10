import { useQuery } from "@tanstack/react-query";
import {
  listLotes as svcListLotes,
  getSublotes as svcGetSublotes,
  lotesService,
} from "../api/lotes.service";
import type { CreateLoteDTO, UpdateLoteDTO, CreateSubloteDTO, UpdateSubloteDTO } from "../model/types";

export const QK_LOTES = {
  LIST: (q: string, page: number, limit: number) => ["lotes", "list", { q, page, limit }] as const,
  SUBLOTES: (loteId: number, q: string, page: number, limit: number) => ["sublotes", "list", loteId, { q, page, limit }] as const,
};

export function useLotesList({
  page = 1,
  limit = 10,
  q = "",
}: {
  page?: number;
  limit?: number;
  q?: string;
} = {}) {
  return useQuery({
    queryKey: QK_LOTES.LIST(q, page, limit),
    queryFn: () => svcListLotes({ page, limit, q: q?.trim() || undefined }),
    staleTime: 15_000,
  });
}

export function useSublotesList(loteId: number, {
  page = 1,
  limit = 10,
  q = "",
}: {
  page?: number;
  limit?: number;
  q?: string;
} = {}) {
  return useQuery({
    queryKey: QK_LOTES.SUBLOTES(loteId, q, page, limit),
    queryFn: () => svcGetSublotes(loteId, { page, limit, q: q?.trim() || undefined }),
    enabled: !!loteId,
    staleTime: 15_000,
  });
}

// === MUTATIONS ===

export function useCreateLote() {
  return {
    createLote: (dto: CreateLoteDTO) => lotesService.createLote(dto),
    loading: false // React Query mutation gives isPending, but legacy code expected 'loading'
  };
}

export function useUpdateLote() {
  return {
    updateLote: (id: number, dto: UpdateLoteDTO) => lotesService.updateLote(id, dto),
    loading: false
  };
}

export function useCreateSublote() {
  return {
    createSublote: (dto: CreateSubloteDTO) => lotesService.createSublote({
      ...dto,
      nombre: dto.nombre_sublote,
      idLote: dto.id_lote_fk,
      // @ts-ignore
      ...dto as any
    }),
    loading: false
  };
}

export function useUpdateSublote() {
  return {
    updateSublote: (id: number, dto: UpdateSubloteDTO) => lotesService.updateSublote(id, {
      ...dto,
      nombre: dto.nombre_sublote,
      // @ts-ignore
      ...dto as any
    }),
    loading: false
  };
}
