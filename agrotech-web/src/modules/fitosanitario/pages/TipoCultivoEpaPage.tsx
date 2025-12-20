import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import TipoCultivoEpaFeature from "../ui/TipoCultivoEpaFeature";

import { useFitosanitarioRealtime } from "../hooks/useFitosanitarioRealtime";

export default function TipoCultivoEpaPage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useFitosanitarioRealtime();

  useEffect(() => {
    setTitle("Gestión de Tipos Cultivo EPA");
  }, [setTitle]);

  return <TipoCultivoEpaFeature />;
}