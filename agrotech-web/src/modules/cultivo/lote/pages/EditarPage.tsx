import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import EditarLoteFeature from "../features/EditarLoteFeature";

export default function EditarPageLote() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const { id_lote } = useParams<{ id_lote: string }>();
  const loteId = Number(id_lote);

  useEffect(() => {
    setTitle("Editar Lote");
  }, [setTitle]);

  if (!id_lote || isNaN(loteId)) return <p>ID de lote inválido</p>;

  return <EditarLoteFeature loteId={loteId} />;
}
