import { useState } from "react";
import { subloteService } from "../api/sublotes.service";
import type { CreateSubloteDTO, Sublote } from "../model/types";

export function useCreateSublote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSublote = async (payload: CreateSubloteDTO): Promise<Sublote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await subloteService.createSublote(payload);
      subloteService.emit("sublotes:create", payload); // notificar por WebSocket
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createSublote, loading, error };
}
