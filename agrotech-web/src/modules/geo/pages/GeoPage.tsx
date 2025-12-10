import { useState, useMemo, useRef } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGeoData } from "../hooks/useGeoData";
import GeoMetrics from "../ui/GeoMetrics";
import GeoPillToggle, { type GeoTab } from "../ui/GeoPillToggle";
import { LoteListFeature, type LoteListRef } from "../features/LoteListFeature";
import { SubloteListFeature, type SubloteListRef } from "../features/SubloteListFeature";
import Surface from "../ui/Surface";

export default function GeoPage() {
  const { data: lotes = [], error } = useGeoData();
  const [activeTab, setActiveTab] = useState<GeoTab>("lotes");

  const loteListRef = useRef<LoteListRef>(null);
  const subloteListRef = useRef<SubloteListRef>(null);

  // Metrics logic based on active tab
  const metrics = useMemo(() => {
    if (activeTab === "lotes") {
      const count = lotes.length;
      const areaM2 = lotes.reduce((acc, l) => acc + Number(l.area_lote || 0), 0);
      return { countLabel: "Total Lotes", count, areaM2 };
    } else {
      const sublotes = lotes.flatMap(l => l.sublotes);
      const count = sublotes.length;
      const areaM2 = sublotes.reduce((acc, s) => acc + Number(s.area_sublote || 0), 0);
      return { countLabel: "Total Sublotes", count, areaM2 };
    }
  }, [lotes, activeTab]);

  const handleAddClick = () => {
    if (activeTab === "lotes") {
      loteListRef.current?.openCreateModal();
    } else {
      subloteListRef.current?.openCreateModal();
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-500">Error cargando datos de georreferenciación</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Georreferenciación</h1>
        <p className="text-sm opacity-70">Gestiona la ubicación y geometría de tus lotes y sublotes</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GeoPillToggle value={activeTab} onChange={setActiveTab} />
        <Button
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleAddClick}
          className="font-semibold text-black shadow-md"
        >
          {activeTab === "lotes" ? "Nuevo Lote" : "Nuevo Sublote"}
        </Button>
      </div>

      {/* Content */}
      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6 space-y-6">
          {/* Metrics */}
          <GeoMetrics {...metrics} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              {activeTab === "lotes" && <LoteListFeature ref={loteListRef} />}
              {activeTab === "sublotes" && <SubloteListFeature ref={subloteListRef} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div>
  );
}
