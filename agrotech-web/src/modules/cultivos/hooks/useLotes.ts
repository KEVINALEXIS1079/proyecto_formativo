import { useQuery } from "@tanstack/react-query";
import {
  listLotes as svcListLotes,
  getSublotes as svcGetSublotes,
} from "../api/lotes.service";

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