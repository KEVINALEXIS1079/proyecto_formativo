import { useQuery } from "@tanstack/react-query";
import { reportesService } from "../api/reportes.service";
import type { ReporteFilters } from "../model/types";

export function useReporteCostosRentabilidad(filters?: ReporteFilters) {
  return useQuery({
    queryKey: ["reportes", "costos-rentabilidad", filters],
    queryFn: () => reportesService.getCostosRentabilidad(filters),
    enabled: !!filters?.cultivoId,
    staleTime: 30000,
  });
}

export function useReporteCompleto(filters?: ReporteFilters) {
  return useQuery({
    queryKey: ["reportes", "completo", filters],
    queryFn: () => reportesService.getReporteCompleto(filters),
    enabled: !!filters?.cultivoId,
    staleTime: 30000,
  });
}