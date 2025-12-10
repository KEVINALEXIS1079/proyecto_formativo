import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeProveedor } from "../api/proveedores.service";
import { QK_PROVEEDORES_LIST } from "./useProveedorList";

export function useRemoveProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeProveedor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_PROVEEDORES_LIST });
    },
  });
}