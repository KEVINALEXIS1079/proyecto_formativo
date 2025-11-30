import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { useGeoData } from "../hooks/useGeoData";
import GeoMap from "../widgets/GeoMap";
import GeoFilters from "../ui/GeoFilters";
import SectionTitle from "../ui/SectionTitle";
import { Card, CardBody, Tabs, Tab, Button, Chip, Select, SelectItem } from "@heroui/react";
import { List, Map as MapIcon, Edit, MapPin, Ruler, Layers } from "lucide-react";
import SubloteModal from "../widgets/SubloteModal";
import type { Sublote } from "../../cultivo/sublote/model/types";

export interface SubloteListRef {
  openCreateModal: () => void;
}

export const SubloteListFeature = forwardRef<SubloteListRef>((_, ref) => {
  const { data: lotes = [], isLoading } = useGeoData();
  const [q, setQ] = useState("");
  const [selectedLoteId, setSelectedLoteId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSublote, setSelectedSublote] = useState<Sublote | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<string>("info");

  const filteredSublotes = useMemo(() => {
    let allSublotes = lotes.flatMap(l => l.sublotes);
    
    // Filter by selected Lote
    if (selectedLoteId !== "all") {
        allSublotes = allSublotes.filter(s => {
            // Find the lote for this sublote to check ID
            const parentLote = lotes.find(l => l.nombre_lote === s.loteNombre);
            return parentLote?.id_lote_pk?.toString() === selectedLoteId;
        });
    }

    // Sort by ID to maintain consistent order
    const sortedSublotes = [...allSublotes].sort((a, b) => (a.id_sublote_pk || 0) - (b.id_sublote_pk || 0));
    
    if (!q.trim()) return sortedSublotes;
    const lowerQ = q.toLowerCase();
    return sortedSublotes.filter(s => s.nombre_sublote.toLowerCase().includes(lowerQ));
  }, [lotes, q, selectedLoteId]);

  const filteredLotesForMap = useMemo(() => {
    let lotesToMap = lotes;

    // Filter by selected Lote
    if (selectedLoteId !== "all") {
        lotesToMap = lotes.filter(l => l.id_lote_pk?.toString() === selectedLoteId);
    }

    if (!q.trim()) return lotesToMap;
    const lowerQ = q.toLowerCase();
    return lotesToMap.map(l => ({
        ...l,
        sublotes: l.sublotes.filter(s => s.nombre_sublote.toLowerCase().includes(lowerQ))
    })).filter(l => l.sublotes.length > 0);
  }, [lotes, q, selectedLoteId]);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedSublote(undefined);
      setIsModalOpen(true);
    },
  }));

  const handleEdit = (sublote: Sublote) => {
    setSelectedSublote(sublote);
    setIsModalOpen(true);
  };

  const handleViewOnMap = () => {
    setActiveTab("mapa");
  };

  const handleLoteChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    setSelectedLoteId(value || "all");
  };

  if (isLoading) return <div>Cargando sublotes...</div>;

  return (
    <div className="space-y-6">
      <GeoFilters q={q} setQ={setQ} placeholder="Buscar sublotes...">
        <div>
          <SectionTitle>Lote</SectionTitle>
          <Select
            aria-label="Filtrar por lote"
            placeholder="Todos los lotes"
            selectedKeys={selectedLoteId ? [selectedLoteId] : ['all']}
            onSelectionChange={handleLoteChange}
            variant="bordered"
            radius="lg"
            popoverProps={{
              placement: "bottom",
              offset: 8,
              classNames: { content: "max-h-80 overflow-auto" },
            }}
            classNames={{
              trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              value: "text-sm",
              popoverContent: "rounded-xl min-w-[18rem] max-h-80 overflow-auto",
              listbox: "max-h-80 overflow-auto",
            }}
          >
            {[
              <SelectItem key="all" className="text-sm py-2">Todos</SelectItem>,
              ...lotes.map((lote) => (
                <SelectItem key={String(lote.id_lote_pk)} className="text-sm py-2">
                  {lote.nombre_lote}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>
      </GeoFilters>

      <Tabs 
        aria-label="Vistas" 
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        color="primary" 
        variant="underlined"
        classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-[#17C964]",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-[#17C964] font-medium"
        }}
      >
        <Tab
          key="info"
          title={
            <div className="flex items-center space-x-2">
              <List size={18} />
              <span>Información</span>
            </div>
          }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {filteredSublotes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <Layers size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {q.trim() || selectedLoteId !== "all" ? "No se encontraron sublotes" : "No hay sublotes registrados"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {q.trim() || selectedLoteId !== "all"
                                ? "Intenta con otros filtros" 
                                : "Comienza creando tu primer sublote con el botón 'Nuevo Sublote'"}
                        </p>
                    </div>
                ) : (
                    filteredSublotes.map((sublote, index) => (
                    <Card key={`${sublote.id_sublote_pk}-${index}`} shadow="sm" className="hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 group">
                        <CardBody className="p-0">
                            <div className="p-5 pb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm shadow-sm">
                                            {sublote.id_sublote_pk}
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-green-600 transition-colors line-clamp-1">
                                            {sublote.nombre_sublote}
                                        </h4>
                                    </div>
                                    <Chip size="sm" color="success" variant="flat" className="font-medium">Sublote</Chip>
                                </div>
                            </div>
                            
                            <div className="px-5 py-3 bg-gray-50/50 dark:bg-zinc-900/30 border-y border-gray-100 dark:border-gray-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Área Total</p>
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                            <Ruler size={16} className="text-gray-400" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{Math.round(sublote.area_sublote).toLocaleString('es-CO')} m²</span>
                                                <span className="font-medium">{(sublote.area_sublote / 10000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Centroide</p>
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="font-medium text-xs">
                                                {(() => {
                                                    if (!sublote.coordenadas_sublote || sublote.coordenadas_sublote.length === 0) return "N/A";
                                                    const lat = sublote.coordenadas_sublote.reduce((sum, c) => sum + c.latitud_sublote, 0) / sublote.coordenadas_sublote.length;
                                                    const lng = sublote.coordenadas_sublote.reduce((sum, c) => sum + c.longitud_sublote, 0) / sublote.coordenadas_sublote.length;
                                                    return (
                                                        <div className="flex flex-col">
                                                            <span>Latitud: {lat.toFixed(4)}</span>
                                                            <span>Longitud: {lng.toFixed(4)}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Lote Padre</p>
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                            <MapIcon size={16} className="text-gray-400" />
                                            {/* @ts-ignore: loteNombre comes from GeoSublote extension */}
                                            <span className="font-medium truncate" title={sublote.loteNombre}>{sublote.loteNombre || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex justify-between items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="light" 
                                    className="text-gray-500 hover:text-green-600"
                                    startContent={<MapIcon size={16} />}
                                    onPress={handleViewOnMap}
                                >
                                    Ver en mapa
                                </Button>
                                <Button 
                                    size="sm" 
                                    color="success" 
                                    className="font-semibold shadow-md"
                                    startContent={<Edit size={16} />}
                                    onPress={() => handleEdit(sublote)}
                                >
                                    Gestionar
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )))
                }
            </div>
        </Tab>
        <Tab
          key="mapa"
          title={
            <div className="flex items-center space-x-2">
              <MapIcon size={18} />
              <span>Mapa</span>
            </div>
          }
        >
            <div className="bg-white dark:bg-content1 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-1 h-[600px] mt-4">
                <GeoMap lotes={filteredLotesForMap} isSubloteView={true} />
            </div>
        </Tab>
      </Tabs>

      <SubloteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subloteToEdit={selectedSublote}
      />
    </div>
  );
});

SubloteListFeature.displayName = "SubloteListFeature";
