import { useEffect, useState } from "react";
import { loteService } from "../api/lotes.service";
import type { Lote } from "../model/types";

export function useLoteById(id?: number) {
  const [lote, setLote] = useState<Lote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await loteService.getLoteById(id);
        setLote(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return { lote, loading, error };
}
