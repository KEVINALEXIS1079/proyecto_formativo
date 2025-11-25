import { useInfiniteQuery } from "@tanstack/react-query";
import { sensorService } from "../api/sensor.service";
import type { SensorLectura } from "../api/sensor.service";

export function useSensorHistorialInfinite(id?: number, pageSize = 120) {
  return useInfiniteQuery<SensorLectura[], Error, SensorLectura[], [string, string, number | undefined, number], string | undefined>({
    queryKey: ["sensor", "historial", id, pageSize],
    enabled: !!id,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      sensorService.historial(id!, { limit: pageSize, before: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.length) return undefined;
      return lastPage[lastPage.length - 1].fecha; // cursor = el más antiguo
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
