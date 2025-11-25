import { useMemo, useState, useEffect } from "react";
import SubloteMetrics from "../ui/SubloteMetrics";
import SubloteFilters from "../ui/SubloteFilters";
import type { Sublote } from "../model/types";

type Props = {
  sublotes: Sublote[];
  onFilteredChange?: (filtered: Sublote[]) => void;
};

export function FiltrarSubloteFeature({ sublotes, onFilteredChange }: Props) {
  const [q, setQ] = useState("");
  const [selectedLote, setSelectedLote] = useState("Todos");
  const [selectedSublote, setSelectedSublote] = useState("Todos"); // <-- agregado

  // -----------------------------
  //  CÁLCULO DE MÉTRICAS
  // -----------------------------
  const metrics = useMemo(() => {
    const total = sublotes.length;
    const totalArea = sublotes.reduce(
      (acc, s) => acc + Number(s.area_sublote || 0),
      0
    );
    const promedioArea = total > 0 ? totalArea / total : 0;
    return { total, totalArea, promedioArea };
  }, [sublotes]);

  // -----------------------------
  //  FILTRADO DE SUBLOTES
  // -----------------------------
  const filtered = useMemo(() => {
    let data = sublotes;
    if (selectedLote !== "Todos") {
      data = data.filter((x) => x.lote?.nombre_lote === selectedLote);
    }
    if (selectedSublote !== "Todos") {
      data = data.filter((x) => x.nombre_sublote === selectedSublote);
    }
    if (q.trim()) {
      data = data.filter((x) =>
        (x.nombre_sublote || "").toLowerCase().includes(q.trim().toLowerCase())
      );
    }
    return data;
  }, [sublotes, q, selectedLote, selectedSublote]);

  // -----------------------------
  //  COMUNICAR AL PADRE
  // -----------------------------
  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  return (
    <div className="space-y-4">
      <SubloteMetrics {...metrics} />
      <SubloteFilters
        q={q}
        setQ={setQ}
        selectedLote={selectedLote}
        setSelectedLote={setSelectedLote}
        selectedSublote={selectedSublote} // <-- agregado
        setSelectedSublote={setSelectedSublote} // <-- agregado
        sublotes={sublotes}
      />
    </div>
  );
}
