import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import EpaListFeature from "../ui/EpaListFeature";

export default function EpaListPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Módulo fitosanitario");
  }, [setTitle]);

  return <EpaListFeature />;
}