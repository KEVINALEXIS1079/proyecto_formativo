import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import TipoEpaFeature from "../ui/TipoEpaFeature";

export default function TipoEpaPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Gestión de Tipos EPA");
  }, [setTitle]);

  return <TipoEpaFeature />;
}