import { useMemo, useState, useEffect } from "react";
import LoteMetrics from "../ui/LoteMetrics";
import LoteFilters from "../ui/LoteFilters";
import type { Lote } from "../model/types";

type Props = {
  lotes: Lote[];
  onFilteredChange?: (filtered: Lote[]) => void;
};

export function FiltrarLotesFeature({ lotes, onFilteredChange }: Props) {
  const [q, setQ] = useState("");
  const [selectedLote, setSelectedLote] = useState("Todos");

  // -----------------------------
  //  CÁLCULO DE MÉTRICAS
  // -----------------------------
  const metrics = useMemo(() => {
    const total = lotes.length;
    const totalArea = lotes.reduce(
      (acc, l) => acc + Number(l.area_lote || 0),
      0
    );
    const promedioArea = total > 0 ? totalArea / total : 0;
    return { total, totalArea, promedioArea };
  }, [lotes]);

  // -----------------------------
  //  FILTRADO DE LOTES
  // -----------------------------
  const filtered = useMemo(() => {
    let data = lotes;
    if (selectedLote !== "Todos") {
      data = data.filter((x) => x.nombre_lote === selectedLote);
    }
    if (q.trim()) {
      data = data.filter((x) =>
        (x.nombre_lote || "").toLowerCase().includes(q.trim().toLowerCase())
      );
    }
    return data;
  }, [lotes, q, selectedLote]);

  // -----------------------------
  //  COMUNICAR AL PADRE
  // -----------------------------
  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  // -----------------------------
  //  UI
  // -----------------------------
  return (
    <div className="space-y-4">
      <LoteMetrics {...metrics} />
      <LoteFilters
        q={q}
        setQ={setQ}
        selectedLote={selectedLote}
        setSelectedLote={setSelectedLote}
        lotes={lotes}
      />
    </div>
  );
}
