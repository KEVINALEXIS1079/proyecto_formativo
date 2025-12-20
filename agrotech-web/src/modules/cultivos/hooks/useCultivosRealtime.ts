import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cultivosService } from "../api/cultivos.service";

export function useCultivosRealtime() {
  const queryClient = useQueryClient();

  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const debouncedInvalidate = (key: string[], delay: number = 1000) => {
    const timerKey = key.join("-");
    if (timers.current[timerKey]) clearTimeout(timers.current[timerKey]);
    timers.current[timerKey] = setTimeout(() => {
      console.log(`🔄 Realtime: Debounced invalidation for [${key}]`);
      queryClient.invalidateQueries({ queryKey: key });
      delete timers.current[timerKey];
    }, delay);
  };

  useEffect(() => {
    // Eventos de cultivos
    cultivosService.on("cultivos:created", (_cultivo: any) => {
      debouncedInvalidate(["cultivos", "list"]);
    });

    cultivosService.on("cultivos:updated", (cultivo: any) => {
      debouncedInvalidate(["cultivos", "list"]);
      debouncedInvalidate(["cultivos", "detail", cultivo.id_cultivo_pk]);
    });

    cultivosService.on("cultivos:deleted", ({ id_cultivo_pk }: { id_cultivo_pk: number }) => {
      debouncedInvalidate(["cultivos", "list"]);
      queryClient.removeQueries({ queryKey: ["cultivos", "detail", id_cultivo_pk] });
    });

    cultivosService.on("cultivos:restored", (_cultivo: any) => {
      debouncedInvalidate(["cultivos", "list"]);
    });

    // Cleanup
    return () => {
      cultivosService.disconnect();
      // Clear all timers on unmount
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [queryClient]);
}