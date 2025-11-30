import { useQuery } from "@tanstack/react-query";
import { geoService } from "../api/geo.service";

export function useGeoData() {
  return useQuery({
    queryKey: ["geo", "lotes"],
    queryFn: () => geoService.getLotes(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
