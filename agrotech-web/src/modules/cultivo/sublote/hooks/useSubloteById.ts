import { useEffect, useState } from "react";
import { subloteService } from "../api/sublotes.service";
import type { Sublote } from "../model/types";

export function useSubloteById(id?: number) {
  const [sublote, setSublote] = useState<Sublote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await subloteService.getSubloteById(id);
        setSublote(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return { sublote, loading, error };
}
