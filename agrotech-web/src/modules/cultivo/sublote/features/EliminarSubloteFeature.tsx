import { useState } from "react";
import { useDeleteSublote } from "../hooks";
import type { Sublote } from "../model/types";


type Props = {
  onDeleted?: (id: number) => void;
};

export default function EliminarSubloteFeature({ onDeleted }: Props) {
  const { deleteSublote } = useDeleteSublote();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (sublote: Sublote | number) => {
    const id = typeof sublote === "number" ? sublote : sublote.id_sublote_pk;
    if (!id) return;
    setLoading(true);
    try {
      await deleteSublote(id);
      onDeleted?.(id);
    } finally {
      setLoading(false);
    }
  };

  return { handleDelete, loading };
}
