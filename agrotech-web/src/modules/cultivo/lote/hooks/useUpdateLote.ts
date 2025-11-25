import { useState } from "react";
import { loteService } from "../api/lotes.service";
import type { CreateLoteDTO, Lote } from "../model/types";

export function useUpdateLote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLote = async (id: number, payload: CreateLoteDTO): Promise<Lote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await loteService.updateLote(id, payload);
      // ❌ No emitir nada, el backend ya lo hace automáticamente
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateLote, loading, error };
}
