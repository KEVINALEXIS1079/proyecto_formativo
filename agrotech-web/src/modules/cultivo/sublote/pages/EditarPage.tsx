// EditarPageSublote.tsx
import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import EditarSubloteFeature from "../features/EditarSubloteFeature";

export default function EditarPageSublote() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const { id_sublote } = useParams<{ id_sublote: string }>();

  useEffect(() => {
    setTitle("Editar Sublote");
  }, [setTitle]);

  if (!id_sublote) return <p>ID de sublote no válido.</p>;

  return <EditarSubloteFeature subloteId={Number(id_sublote)} />;
}
