import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import CrearLoteFeature from "../features/CrearLoteFeature";

export default function CreatePageLote() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Registrar Lote");
  }, [setTitle]);

  return <CrearLoteFeature />;
}
