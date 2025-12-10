import { useState } from "react";
import { ventaService } from "../api/ventas.service";
import type { CreateVentaDTO, Venta } from "../model/types";

export function useCreateVenta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVenta = async (payload: CreateVentaDTO): Promise<Venta | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventaService.createVenta(payload);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createVenta, loading, error };
}