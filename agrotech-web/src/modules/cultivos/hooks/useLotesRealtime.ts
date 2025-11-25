import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { lotesService } from "../api/lotes.service";

export function useLotesRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Eventos de lotes del servidor
    lotesService.onCreated((_lote: any) => {
      // Invalidar listas de lotes
      queryClient.invalidateQueries({ queryKey: ["lotes", "list"] });
    });

    lotesService.onUpdated((lote: any) => {
      // Invalidar listas de lotes
      queryClient.invalidateQueries({ queryKey: ["lotes", "list"] });
      // Invalidar query específica del lote
      queryClient.invalidateQueries({ queryKey: ["lotes", "byId", lote.id_lote_pk] });
    });

    lotesService.onDeleted(({ id_lote_pk }: { id_lote_pk: number }) => {
      // Invalidar listas de lotes
      queryClient.invalidateQueries({ queryKey: ["lotes", "list"] });
      // Remover del cache la query específica
      queryClient.removeQueries({ queryKey: ["lotes", "byId", id_lote_pk] });
    });

    lotesService.onRestored((_lote: any) => {
      // Invalidar listas de lotes
      queryClient.invalidateQueries({ queryKey: ["lotes", "list"] });
    });

    // Cleanup
    return () => {
      lotesService.offCreated();
      lotesService.offUpdated();
      lotesService.offDeleted();
      lotesService.offRestored();
    };
  }, [queryClient]);
}