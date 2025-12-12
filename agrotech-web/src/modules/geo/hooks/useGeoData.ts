import { useQuery } from "@tanstack/react-query";
import { geoService } from "../api/geo.service";

export function useGeoData(filters?: { estado?: string }) {
  return useQuery({
    queryKey: ["geo", "lotes", filters],
    queryFn: () => geoService.getLotes(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
