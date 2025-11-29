import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import EpaEditFeature from "../ui/EpaEditFeature";

export default function EpaEditPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle(`Editar EPA ${id || ""}`);
  }, [setTitle, id]);

  return <EpaEditFeature />;
}