import { useEffect, useState } from "react";
import { ventaService } from "../api/ventas.service";
import type { Venta } from "../models/types/sales.types";

interface UseVentaByIdReturn {
  venta: Venta | null;
  loading: boolean;
  error: string | null;
}

export function useVentaById(id: number): UseVentaByIdReturn {
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenta() {
      setLoading(true);
      try {
        const data = await ventaService.getVentaById(id);
        setVenta(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchVenta();
    }
  }, [id]);

  return { venta, loading, error };
}