import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtecdLayout";
import EpaDetailFeature from "../ui/EpaDetailFeature";

export default function EpaDetailPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle(`EPA ${id || ""}`);
  }, [setTitle, id]);

  return <EpaDetailFeature />;
}