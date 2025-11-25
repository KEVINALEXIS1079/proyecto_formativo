import { useQuery } from "@tanstack/react-query";
import { listProveedores } from "../api/proveedores.service";

export const QK_PROVEEDORES_LIST = ["inventario", "proveedores", "list"] as const;

export function useProveedorList(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: [...QK_PROVEEDORES_LIST, params],
    queryFn: () => listProveedores(params),
    staleTime: 15_000,
  });
}