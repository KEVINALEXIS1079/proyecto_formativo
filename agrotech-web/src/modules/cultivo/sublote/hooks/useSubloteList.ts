import { useEffect, useState } from "react";
import { subloteService } from "../api/sublotes.service";
import type { Sublote } from "../model/types";

export function useSubloteList() {
  const [sublotes, setSublotes] = useState<Sublote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSublotes = async () => {
    try {
      setLoading(true);
      const data = await subloteService.listSublotes();
      setSublotes(data);
      setError(null);
    } catch (err: any) {
      console.error(" Error al listar sublotes:", err);
      setError(err.message || "Error al obtener los sublotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSublotes();

    // Conectar socket
    const socket = subloteService.connect();

    // Eventos de tiempo real
    socket.on("sublotes:created", (sublote: Sublote) => {
      setSublotes(prev => [...prev, sublote]);
    });

    socket.on("sublotes:updated", (updated: Sublote) => {
      setSublotes(prev =>
        prev.map(s => (s.id_sublote_pk === updated.id_sublote_pk ? updated : s))
      );
    });

    socket.on("sublotes:removed", ({ id_sublote_pk }: { id_sublote_pk: number }) => {
      setSublotes(prev => prev.filter(s => s.id_sublote_pk !== id_sublote_pk));
    });

    socket.on("sublotes:restored", (restored: Sublote) => {
      setSublotes(prev => [...prev, restored]);
    });

    // Limpiar al desmontar
    return () => {
      socket.off("sublotes:created");
      socket.off("sublotes:updated");
      socket.off("sublotes:removed");
      socket.off("sublotes:restored");
      subloteService.disconnect();
    };
  }, []);

  return { sublotes, loading, error, refresh: fetchSublotes };
}
