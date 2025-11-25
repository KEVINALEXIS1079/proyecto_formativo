import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadInsumoImage } from "../api/insumos.service";
import { QK_INSUMO_BY_ID } from "./useInsumoById";

export function useUploadInsumoImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadInsumoImage(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [...QK_INSUMO_BY_ID, id] });
    },
  });
}