import { useState } from "react";
import { loteService } from "../api/lotes.service";

export function useDeleteLote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLote = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await loteService.removeLote(id);
      loteService.emit("lotes:remove", { id }); // WebSocket
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteLote, loading, error };
}
