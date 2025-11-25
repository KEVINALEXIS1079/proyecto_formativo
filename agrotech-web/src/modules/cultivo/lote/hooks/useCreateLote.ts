import { useState } from "react";
import { loteService } from "../api/lotes.service";
import type { CreateLoteDTO, Lote } from "../model/types";

export function useCreateLote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLote = async (payload: CreateLoteDTO): Promise<Lote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await loteService.createLote(payload);
      loteService.emit("lotes:create", payload); // notificar por WebSocket
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createLote, loading, error };
}
