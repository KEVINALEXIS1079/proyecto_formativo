import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import EpaCreateFeature from "../ui/EpaCreateFeature";

export default function EpaCreatePage() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Crear EPA");
  }, [setTitle]);

  return <EpaCreateFeature />;
}