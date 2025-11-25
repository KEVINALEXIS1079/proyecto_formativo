import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import CrearSubloteFeature from "../features/CrearSubloteFeature";

export default function CrearPageSublote() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Registrar Sublote");
  }, [setTitle]);

  return <CrearSubloteFeature />;
}
