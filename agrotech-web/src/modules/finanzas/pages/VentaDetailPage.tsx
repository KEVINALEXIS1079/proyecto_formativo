import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import VentaDetailFeature from "../ui/VentaDetailFeature";

export default function VentaDetailPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle("Detalle de Venta");
  }, [setTitle]);

  if (!id) return <p>ID de venta no encontrado</p>;

  return <VentaDetailFeature id={parseInt(id)} />;
}