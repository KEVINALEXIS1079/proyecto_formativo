import { useEffect, useState } from "react";
import { ventaService } from "../api/ventas.service";
import type { Venta, VentaFilters } from "../model/types";

interface UseVentaListReturn {
  ventas: Venta[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: VentaFilters) => void;
}

export function useVentaList(initialFilters?: VentaFilters): UseVentaListReturn {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VentaFilters | undefined>(initialFilters);

  const fetchVentas = async (currentFilters?: VentaFilters) => {
    setLoading(true);
    try {
      const data = await ventaService.listVentas(currentFilters);
      setVentas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas(filters);
  }, [filters]);

  const refetch = (newFilters?: VentaFilters) => {
    setFilters(newFilters);
  };

  return { ventas, loading, error, refetch };
}