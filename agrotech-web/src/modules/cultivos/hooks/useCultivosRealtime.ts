import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cultivosService } from "../api/cultivos.service";

export function useCultivosRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Eventos de cultivos
    cultivosService.on("cultivos:created", (_cultivo: any) => {
      // Invalidar listas de cultivos
      queryClient.invalidateQueries({ queryKey: ["cultivos", "list"] });
    });

    cultivosService.on("cultivos:updated", (cultivo: any) => {
      // Invalidar listas de cultivos
      queryClient.invalidateQueries({ queryKey: ["cultivos", "list"] });
      // Invalidar query específica del cultivo
      queryClient.invalidateQueries({ queryKey: ["cultivos", "detail", cultivo.id_cultivo_pk] });
    });

    cultivosService.on("cultivos:deleted", ({ id_cultivo_pk }: { id_cultivo_pk: number }) => {
      // Invalidar listas de cultivos
      queryClient.invalidateQueries({ queryKey: ["cultivos", "list"] });
      // Remover del cache la query específica
      queryClient.removeQueries({ queryKey: ["cultivos", "detail", id_cultivo_pk] });
    });

    cultivosService.on("cultivos:restored", (_cultivo: any) => {
      // Invalidar listas de cultivos
      queryClient.invalidateQueries({ queryKey: ["cultivos", "list"] });
    });

    // Cleanup
    return () => {
      cultivosService.disconnect();
    };
  }, [queryClient]);
}