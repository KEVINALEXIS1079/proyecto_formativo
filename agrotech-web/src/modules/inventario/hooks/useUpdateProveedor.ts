import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProveedor } from "../api/proveedores.service";
import type { UpdateProveedorInput } from "../model/types";
import { QK_PROVEEDORES_LIST } from "./useProveedorList";
import { QK_PROVEEDOR_BY_ID } from "./useProveedorById";

export function useUpdateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProveedorInput }) => updateProveedor(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK_PROVEEDORES_LIST });
      qc.invalidateQueries({ queryKey: [...QK_PROVEEDOR_BY_ID, id] });
    },
  });
}