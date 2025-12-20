import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import EpaListFeature from "../features/EpaListFeature";

import { useFitosanitarioRealtime } from "../hooks/useFitosanitarioRealtime";

export default function EpaListPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useFitosanitarioRealtime();

  useEffect(() => {
    setTitle("Módulo fitosanitario");
  }, [setTitle]);

  return <EpaListFeature />;
}