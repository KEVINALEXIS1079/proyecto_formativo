import { useEffect, useState } from "react";
import { loteService } from "../api/lotes.service";
import type { Lote } from "../model/types";
interface UseLoteListReturn {
  lotes: Lote[];
  loading: boolean;
  error: string | null;
}

export function useLoteList(): UseLoteListReturn {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLotes() {
      setLoading(true);
      try {
        const data = await loteService.listLotes();
        setLotes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLotes();
  }, []);

  return { lotes, loading, error };
}

