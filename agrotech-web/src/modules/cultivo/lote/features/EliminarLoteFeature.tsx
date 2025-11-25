import { useState } from "react";
import { useDeleteLote } from "../hooks";
import type { Lote } from "../widgets/LoteMapList";

type Props = {
  onDeleted?: (id: number) => void;
};

export default function EliminarLoteFeature({ onDeleted }: Props) {
  const { deleteLote } = useDeleteLote();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (lote: Lote | number) => {
    //  Permite recibir tanto el objeto como el id directo
    const id =
      typeof lote === "number"
        ? lote
        : (lote as Lote)?.id_lote_pk;

    if (!id) {
      console.warn(" No se recibió un ID válido para eliminar el lote:", lote);
      return;
    }

    setLoading(true);
    try {
      await deleteLote(id);
      onDeleted?.(id);
    } finally {
      setLoading(false);
    }
  };

  return { handleDelete, loading };
}
