// src/modules/usuarios/usuarios/hooks/useUsuarios.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UsuarioLite } from "../model/types";
import {
  listUsuarios as svcListUsuarios,
  listRolesLite as svcListRolesLite,
  updateUsuario as svcUpdateUsuario,
  updateEstado as svcUpdateEstado,
  softDeleteUsuario as svcSoftDeleteUsuario,
  restoreUsuario as svcRestoreUsuario,
} from "../api/usuario.service";

export type TabKey = "gestionar" | "restaurar";

type UsuariosListResp = {
  items: UsuarioLite[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

type SvcListUsuariosParams = {
  page: number;
  limit: number;
  q?: string;
  estado?: "todos" | "eliminado";
};

type SvcListUsuariosResp =
  | UsuariosListResp
  | UsuarioLite[]; // el backend puede devolver {items,...} o arreglo plano (demo)

// =========================
// Query Keys (prefijos)
// =========================
export const QK = {
  USUARIOS_LIST_ROOT: ["usuarios", "list"] as const, // prefijo para invalidar cualquier listado
  USUARIOS_LIST: (tab: TabKey, q: string, page: number, limit: number) =>
    ["usuarios", "list", { tab, q, page, limit }] as const,
  ROLES_LITE: ["roles", "lite"] as const,
};

export function useUsuariosList({
  page,
  q,
  tab,
  limit = 10,
}: {
  page: number;
  q: string;
  tab: TabKey;
  limit?: number;
}) {
  const estado = tab === "restaurar" ? ("eliminado" as const) : ("todos" as const);

  return useQuery<UsuariosListResp, unknown, UsuariosListResp>({
    queryKey: QK.USUARIOS_LIST(tab, q, page, limit),
    queryFn: async (): Promise<UsuariosListResp> => {
      const resp = (await svcListUsuarios({
        page,
        limit,
        q: q?.trim() || undefined,
        estado,
      } as SvcListUsuariosParams)) as SvcListUsuariosResp;

      // Normalizamos la forma { items, ... } o []
      if (resp && typeof resp === "object" && "items" in resp) {
        const r = resp as UsuariosListResp;
        return r;
      }

      const arr: UsuarioLite[] = Array.isArray(resp) ? resp : [];
      // si el servicio no pagina, devolvemos una forma paginada mínima
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
    // Filtrado y paginación se hacen en select, dejando crudo en cache (útil si reusas dataset)
    select: (data) => {
      const baseItems = data.items ?? [];
      const filtered =
        estado === "eliminado"
          ? baseItems.filter((u) => u.estado === "eliminado")
          : baseItems.filter((u) => u.estado !== "eliminado");

      // Si el backend ya paginó, respetamos page/limit de data; si no, re-paginamos
      const usingRespPaging = data.total !== undefined && data.limit !== undefined;
      if (usingRespPaging) {
        return {
          ...data,
          items: filtered,
          total: filtered.length,
          hasMore:
            filtered.length > 0
              ? (data.page ?? page) * (data.limit ?? limit) < filtered.length
              : false,
          nextOffset: (data.page ?? page) * (data.limit ?? limit),
        };
      }

      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);
      return {
        items: paged,
        page,
        limit,
        total: filtered.length,
        hasMore: start + limit < filtered.length,
        nextOffset: start + limit,
      };
    },
    staleTime: 15_000,
  });
}

export function useRolesLite() {
  return useQuery<{ items: Array<{ id: number; nombre: string }> }>({
    queryKey: QK.ROLES_LITE,
    queryFn: async () => {
      const data = (await svcListRolesLite()) as
        | { items: Array<{ id: number; nombre: string }> }
        | Array<{ id: number; nombre: string }>;
      if (data && typeof data === "object" && "items" in data) return data;
      return { items: Array.isArray(data) ? data : [] };
    },
    staleTime: 5 * 60_000,
  });
}

/* =========================
 * Mutaciones
 * ========================= */

export function useUsuarioUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<UsuarioLite> & { idRol?: number } }) =>
      svcUpdateUsuario(id, dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.USUARIOS_LIST_ROOT });
    },
  });
}

export function useUsuarioToggleEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: number; to: "activo" | "inactivo" }) =>
      svcUpdateEstado(id, to),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.USUARIOS_LIST_ROOT });
    },
  });
}

export function useUsuarioRemove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svcSoftDeleteUsuario(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.USUARIOS_LIST_ROOT });
    },
  });
}

export function useUsuarioRestore() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => svcRestoreUsuario(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: QK.USUARIOS_LIST_ROOT });

      const prevEntries = qc.getQueriesData<UsuariosListResp>({
        queryKey: QK.USUARIOS_LIST_ROOT,
      }) as [readonly unknown[], UsuariosListResp | undefined][];

      prevEntries.forEach(([key, data]) => {
        if (!data) return;
        const filtered = data.items.filter((u) => u.id !== id);
        qc.setQueryData<UsuariosListResp>(key, {
          ...data,
          items: filtered,
          total: Math.max(0, (data.total ?? filtered.length) - 1),
        });
      });

      return { prevEntries };
    },
    onError: (_err, _id, ctx: { prevEntries?: [readonly unknown[], UsuariosListResp | undefined][] } | undefined) => {
      ctx?.prevEntries?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: QK.USUARIOS_LIST_ROOT });
    },
  });
}
