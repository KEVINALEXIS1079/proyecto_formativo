import { useQuery } from "@tanstack/react-query";
import { getProveedor } from "../api/proveedores.service";

export const QK_PROVEEDOR_BY_ID = ["inventario", "proveedor"] as const;

export function useProveedorById(id: number) {
  console.log('DEBUG: useProveedorById called with id:', id);
  return useQuery({
    queryKey: [...QK_PROVEEDOR_BY_ID, id],
    queryFn: () => {
      console.log('DEBUG: Fetching proveedor with id:', id);
      return getProveedor(id);
    },
    enabled: !!id,
    staleTime: 15_000,
    onError: (error) => {
      console.error('DEBUG: Error fetching proveedor with id:', id, error);
    },
  });
}