import { useQueryClient } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { useGeoData } from "../hooks/useGeoData";
import GeoMap from "../widgets/GeoMap";
import GeoFilters from "../ui/GeoFilters";
import { Card, CardBody, Tabs, Tab, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@heroui/react";
import { List, Map as MapIcon, Edit, MapPin, Ruler, Ban, CheckCircle } from "lucide-react";
import LoteModal from "../widgets/LoteModal";
import type { Lote } from "../../cultivos/model/types";
import { DeleteModal } from "@/shared/components/ui/DeleteModal";

export interface LoteListRef {
  openCreateModal: () => void;
}

export const LoteListFeature = forwardRef<LoteListRef>((_, ref) => {
  const qc = useQueryClient();
  const { data: lotes = [], isLoading, refetch } = useGeoData({ estado: 'activo' }); // Initial query will be updated by state
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("activo");
  
  // Re-query when filter changes
  const { data: lotesFiltered, isFetching } = useGeoData({ estado: statusFilter });
  
  // Use the filtered data source
  const displayLotes = lotesFiltered || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<string>("info");

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Toggle Status State
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [loteToToggle, setLoteToToggle] = useState<Lote | undefined>(undefined);
  const [isToggling, setIsToggling] = useState(false);

  const filteredLotes = useMemo(() => {
    // Sort by ID to maintain consistent order
    const sortedLotes = [...displayLotes].sort((a, b) => (a.id_lote_pk || 0) - (b.id_lote_pk || 0));
    if (!q.trim()) return sortedLotes;
    const lowerQ = q.toLowerCase();
    return sortedLotes.filter(l => (l.nombre_lote || "").toLowerCase().includes(lowerQ));
  }, [displayLotes, q]);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedLote(undefined);
      setIsModalOpen(true);
    },
  }));

  const handleEdit = (lote: Lote) => {
    setSelectedLote(lote);
    setIsModalOpen(true);
  };

  const handleViewOnMap = () => {
    setActiveTab("mapa");
  };

  const handleError = (msg: string) => {
    setErrorMessage(msg);
    setErrorModalOpen(true);
  };

  const handleToggleStatus = (lote: Lote) => {
    const isInactive = (lote as any).estado?.toLowerCase() === 'inactivo';
    
    // Only validate when trying to DISABLE (active -> inactive)
    if (!isInactive) {
      // 1. Validate Sublotes
      if (lote.sublotes && lote.sublotes.length > 0) {
        handleError("No se puede inhabilitar este lote porque tiene sublotes asociados.");
        return;
      }
    }

    setLoteToToggle(lote);
    setIsToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!loteToToggle) return;

    setIsToggling(true);
    try {
      const isInactive = (loteToToggle as any).estado === 'inactivo';
      const geoApi = await import("../api/geo.service");
      
      // Update status
      if (loteToToggle.id_lote_pk) {
        await geoApi.geoService.updateLote(loteToToggle.id_lote_pk, { estado: isInactive ? 'activo' : 'inactivo' } as any);
      }
      
      // Invalidate queries
      qc.invalidateQueries({ queryKey: ["geo", "lotes"] });
      // Force immediate refetch
      refetch();
      
      setIsToggleModalOpen(false);
      setLoteToToggle(undefined);
    } catch (err) {
      console.error("Error changing status", err);
      handleError("Error al actualizar estado del lote");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading && !lotesFiltered) return (
    <div className="flex justify-center p-8">
      <Spinner color="success" label="Cargando lotes..." />
    </div>
  );

  const isActivating = loteToToggle ? (loteToToggle as any).estado === 'inactivo' : false;

  return (
    <div className="space-y-6">
      <GeoFilters 
        q={q} 
        setQ={setQ} 
        placeholder="Buscar lotes..." 
        statusFilter={statusFilter}
        onStatusChange={(val) => setStatusFilter(val)}
      />

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
            {filteredLotes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <MapIcon size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {q.trim() ? "No se encontraron lotes" : "No hay lotes registrados"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {q.trim()
                    ? "Intenta con otro término de búsqueda"
                    : "Comienza creando tu primer lote con el botón 'Nuevo Lote'"}
                </p>
              </div>
            ) : (
              filteredLotes.map((lote, index) => (
                <Card key={`${lote.id_lote_pk}-${index}`} shadow="sm" className="hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800 group">
                  <CardBody className="p-0">
                    <div className="p-5 pb-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm ${
                            (lote as any).estado === 'inactivo' 
                              ? "bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500" 
                              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          }`}>
                            {lote.id_lote_pk || "#"}
                          </div>
                          <h4 className={`font-bold text-lg transition-colors line-clamp-1 ${
                            (lote as any).estado === 'inactivo'
                              ? "text-gray-400 dark:text-gray-500 line-through"
                              : "text-gray-900 dark:text-gray-100 group-hover:text-green-600"
                          }`}>
                            {lote.nombre_lote || "Sin Nombre"}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          {(lote as any).estado === 'inactivo' && (
                            <Chip size="sm" color="default" variant="flat" className="font-medium">Inactivo</Chip>
                          )}
                          <Chip size="sm" color="success" variant="flat" className="font-medium">Lote</Chip>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-zinc-900/30 border-y border-gray-100 dark:border-gray-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Área Total</p>
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <Ruler size={16} className="text-gray-400" />
                            <div className="flex flex-col">
                              <span className="font-medium">{Math.round(lote.area_lote || 0).toLocaleString('es-CO')} m²</span>
                              <span className="font-medium">{((lote.area_lote || 0) / 10000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Centroide</p>
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="font-medium text-xs">
                              {(() => {
                                if (!lote.coordenadas_lote || lote.coordenadas_lote.length === 0) return "N/A";
                                const lat = lote.coordenadas_lote.reduce((sum: number, c: any) => sum + c.latitud_lote, 0) / lote.coordenadas_lote.length;
                                const lng = lote.coordenadas_lote.reduce((sum: number, c: any) => sum + c.longitud_lote, 0) / lote.coordenadas_lote.length;
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
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Sublotes</p>
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <MapIcon size={16} className="text-gray-400" />
                            <span className="font-medium">{lote.sublotes ? lote.sublotes.length : 0} registrados</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex justify-end items-center gap-2">
                      <div className="flex-1">
                        <Button
                          size="sm"
                          variant="light"
                          className="text-gray-500 hover:text-green-600"
                          startContent={<MapIcon size={16} />}
                          onPress={handleViewOnMap}
                        >
                          Ver
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isIconOnly
                        className="text-black"
                        onPress={() => handleEdit(lote)}
                        title="Gestionar"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        color={(lote as any).estado?.toLowerCase() === 'inactivo' ? "success" : "danger"}
                        variant="flat"
                        isIconOnly
                        className={(lote as any).estado?.toLowerCase() === 'inactivo' ? "text-success" : "text-danger"}
                        onPress={() => handleToggleStatus(lote)}
                        title={(lote as any).estado?.toLowerCase() === 'inactivo' ? "Habilitar" : "Inhabilitar"}
                      >
                        {(lote as any).estado?.toLowerCase() === 'inactivo' ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )))}
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
            <GeoMap lotes={filteredLotes} />
          </div>
        </Tab>
      </Tabs>

      {/* Modal for Inhibit Errors */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-danger font-bold">
            Acción no permitida
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-700">{errorMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setErrorModalOpen(false)}>
              Entendido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete/Restore Confirmation Modal */}
      <DeleteModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={isActivating ? "Habilitar Lote" : "Inhabilitar Lote"}
        description={isActivating
          ? `¿Estás seguro de habilitar el lote ${loteToToggle?.nombre_lote}? El lote estará disponible nuevamente.`
          : `¿Estás seguro de inhabilitar el lote ${loteToToggle?.nombre_lote}?`
        }
        isLoading={isToggling}
        confirmText={isActivating ? "Habilitar" : "Inhabilitar"}
        confirmColor={isActivating ? "success" : "danger"}
      />

      <LoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loteToEdit={selectedLote}
      />
    </div>
  );
});

LoteListFeature.displayName = "LoteListFeature";
