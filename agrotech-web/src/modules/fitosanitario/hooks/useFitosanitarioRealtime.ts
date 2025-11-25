import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fitosanitarioService } from "../api/fitosanitario.service";
import { QK } from "./useFitosanitario";

export function useFitosanitarioRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Eventos de EPA
    fitosanitarioService.on("epas:created", (epa: any) => {
      // Invalidar listas de EPA
      queryClient.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
    });

    fitosanitarioService.on("epas:updated", (epa: any) => {
      // Invalidar listas de EPA
      queryClient.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
      // Invalidar query específica del EPA
      queryClient.invalidateQueries({ queryKey: QK.EPA_BY_ID(epa.id_epa_pk) });
    });

    fitosanitarioService.on("epas:removed", ({ id_epa_pk }: { id_epa_pk: number }) => {
      // Invalidar listas de EPA
      queryClient.invalidateQueries({ queryKey: QK.EPA_LIST_ROOT });
      // Remover del cache la query específica
      queryClient.removeQueries({ queryKey: QK.EPA_BY_ID(id_epa_pk) });
    });

    // Cleanup
    return () => {
      fitosanitarioService.disconnect();
    };
  }, [queryClient]);
}