import { useState } from "react";
import { subloteService } from "../api/sublotes.service";
import type { CreateSubloteDTO, Sublote } from "../model/types";

export function useUpdateSublote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSublote = async (id: number, payload: CreateSubloteDTO): Promise<Sublote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await subloteService.updateSublote(id, payload);
      subloteService.emit("sublotes:update", { id, dto: payload }); // WebSocket
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateSublote, loading, error };
}
