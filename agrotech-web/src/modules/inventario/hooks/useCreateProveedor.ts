import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProveedor } from "../api/proveedores.service";
import { QK_PROVEEDORES_LIST } from "./useProveedorList";

export function useCreateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_PROVEEDORES_LIST });
    },
  });
}