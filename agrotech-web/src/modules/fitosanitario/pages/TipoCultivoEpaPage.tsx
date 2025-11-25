import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import TipoCultivoEpaFeature from "../ui/TipoCultivoEpaFeature";

export default function TipoCultivoEpaPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Gestión de Tipos Cultivo EPA");
  }, [setTitle]);

  return <TipoCultivoEpaFeature />;
}