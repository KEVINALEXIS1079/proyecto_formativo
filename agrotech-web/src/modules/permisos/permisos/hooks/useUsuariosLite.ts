// src/modules/permisos/permisos/hooks/useUsuariosLite.ts
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listUsuarios,
  usuarioService,
} from "@/modules/usuarios/usuarios/api/usuario.service";

/** Normaliza y ordena los params para que la queryKey sea estable */
function normalizeParams(params?: {
  page?: number; limit?: number; q?: string;
  estado?: "activo" | "inactivo" | "eliminado" | "todos";
  rolId?: number;
}) {
  const p = params ?? {};
  return {
    page: p.page ?? 1,
    limit: p.limit ?? 10,
    q: p.q ?? "",
    estado: p.estado ?? "activo",
    rolId: p.rolId ?? undefined,
  };
}

export const qkUsers = {
  base: ["usuarios", "lite"] as const,
  list: (params: ReturnType<typeof normalizeParams>) =>
    ["usuarios", "lite", params] as const,
};

/**
 * Hook para leer usuarios "lite" con WS:
 * - queryKey estable por params normalizados
 * - invalidación global (todas las variantes) cuando haya eventos WS
 * - cleanups correctos con on/off del service
 */
export function useUsuariosLite(params?: {
  page?: number; limit?: number; q?: string;
  estado?: "activo" | "inactivo" | "eliminado" | "todos";
  rolId?: number;
}) {
  const qc = useQueryClient();
  const norm = useMemo(() => normalizeParams(params), [params]);

  const query = useQuery({
    queryKey: qkUsers.list(norm),
    queryFn: () => listUsuarios(norm),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Invalida TODAS las variantes (cambia filtros, páginas, etc.)
    const invalidateAll = () =>
      qc.invalidateQueries({ queryKey: qkUsers.base, exact: false });

    // Handlers WS
    const handleCreated = (_u?: any) => {
      // opcional: setQueryData fino si quieres
      invalidateAll();
    };
    const handleUpdated = (_u?: any) => {
      invalidateAll();
    };
    const handleDeleted = (_id?: number) => {
      invalidateAll();
    };
    const handleListChanged = () => {
      invalidateAll();
    };

    // Suscribirse
    usuarioService.onCreated(handleCreated);
    usuarioService.onUpdated(handleUpdated);
    usuarioService.onDeleted(handleDeleted);
    usuarioService.onListChanged(handleListChanged);

    // Cleanup usando los off() del service
    return () => {
      usuarioService.offCreated(handleCreated);
      usuarioService.offUpdated(handleUpdated);
      usuarioService.offDeleted(handleDeleted);
      usuarioService.offListChanged(handleListChanged);
    };
  }, [qc, norm]);

  return query; // { data, isLoading, error, ... }
}
