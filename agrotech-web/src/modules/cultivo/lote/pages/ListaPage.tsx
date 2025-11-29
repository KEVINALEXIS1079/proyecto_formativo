import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import ListarLotesFeature from "../features/ListarLotesFeature";

export default function ListaPageLote() {
  const { setTitle } = useOutletContext<LayoutContext>();

  useEffect(() => {
    setTitle("Lista de Lotes");
  }, [setTitle]);

  return <ListarLotesFeature />;
}
