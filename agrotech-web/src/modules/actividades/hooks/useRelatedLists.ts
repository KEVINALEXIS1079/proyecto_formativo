import { useQuery } from "@tanstack/react-query";
import { listUsuarios } from "../../usuarios/usuarios/api/usuario.service";
import { listInsumos } from "../../inventario/api/insumos.service";
import { listCategoriasInsumo } from "../../inventario/api/categorias-insumo.service";
import { listLotes, getSublotes } from "../../cultivos/api/lotes.service";
import { listCultivos } from "../../cultivos/api/cultivos.service";
import { listActividadSubtipos } from "../api/actividad-subtipos.service";
import { listServicios as listServiciosFromServicios } from "../api/servicios.service";

export const QK_RELATED = {
  USUARIOS: (q: string, page: number, limit: number) => ["related", "usuarios", { q, page, limit }] as const,
  INSUMOS: (q: string, categoriaId: number | undefined, page: number, limit: number) => ["related", "insumos", { q, categoriaId, page, limit }] as const,
  CATEGORIAS_INSUMO: (q: string, page: number, limit: number) => ["related", "categorias-insumo", { q, page, limit }] as const,
  LOTES: (q: string, page: number, limit: number) => ["related", "lotes", { q, page, limit }] as const,
  SUBLOTES: (loteId: number | undefined, q: string, page: number, limit: number) => ["related", "sublotes", { loteId, q, page, limit }] as const,
  CULTIVOS: (q: string, page: number, limit: number) => ["related", "cultivos", { q, page, limit }] as const,
  SUBTIPOS: (q: string, page: number, limit: number) => ["related", "subtipos", { q, page, limit }] as const,
  SERVICIOS: (q: string, page: number, limit: number) => ["related", "servicios", { q, page, limit }] as const,
};

export function useUsuariosList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.USUARIOS(q, page, limit),
    queryFn: () => listUsuarios({ q, page, limit }),
    staleTime: 30_000,
  });
}

export function useInsumosList({
  q = "",
  categoriaId,
  page = 1,
  limit = 50,
}: {
  q?: string;
  categoriaId?: number;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.INSUMOS(q, categoriaId, page, limit),
    queryFn: () => listInsumos({ q, categoriaId, page, limit }),
    staleTime: 30_000,
  });
}

export function useCategoriasInsumoList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.CATEGORIAS_INSUMO(q, page, limit),
    queryFn: () => listCategoriasInsumo({ q, page, limit }),
    staleTime: 60_000,
  });
}

export function useLotesList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.LOTES(q, page, limit),
    queryFn: () => listLotes({ q, page, limit }),
    staleTime: 60_000,
  });
}

export function useSublotesList({
  loteId,
  q = "",
  page = 1,
  limit = 50,
}: {
  loteId?: number;
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.SUBLOTES(loteId, q, page, limit),
    queryFn: () => loteId ? getSublotes(loteId, { q, page, limit }) : Promise.resolve([]),
    staleTime: 30_000,
  });
}

export function useCultivosList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.CULTIVOS(q, page, limit),
    queryFn: () => listCultivos({ q, page, limit }),
    staleTime: 30_000,
  });
}

export function useSubtiposList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.SUBTIPOS(q, page, limit),
    queryFn: () => listActividadSubtipos({ q, page, limit }),
    staleTime: 60_000,
  });
}

export function useServiciosList({
  q = "",
  page = 1,
  limit = 50,
}: {
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK_RELATED.SERVICIOS(q, page, limit),
    queryFn: () => listServiciosFromServicios({ q, page, limit }),
    staleTime: 30_000,
  });
}
