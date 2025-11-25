import { useState } from "react";
import { subloteService } from "../api/sublotes.service";

export function useDeleteSublote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSublote = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await subloteService.removeSublote(id);
      subloteService.emit("sublotes:remove", { id }); // WebSocket
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteSublote, loading, error };
}
