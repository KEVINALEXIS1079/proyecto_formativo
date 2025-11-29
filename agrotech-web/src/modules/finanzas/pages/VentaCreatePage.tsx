import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import VentaCreateFeature from "../ui/VentaCreateFeature";

export default function VentaCreatePage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Crear Venta");
  }, [setTitle]);

  return <VentaCreateFeature />;
}