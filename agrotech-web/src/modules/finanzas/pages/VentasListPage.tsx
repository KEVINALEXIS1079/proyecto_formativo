import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import VentasListFeature from "../ui/VentasListFeature";

export default function VentasListPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Lista de Ventas");
  }, [setTitle]);

  return <VentasListFeature />;
}