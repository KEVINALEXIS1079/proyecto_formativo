import { useState, useMemo, useCallback, useRef } from "react";
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Pagination } from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { toast } from "react-hot-toast";
import EpaCard from "../widgets/EpaCard";
import EpaForm from "../widgets/EpaForm";
import EpaDetail from "../widgets/EpaDetail";
import EpaFilters from "../ui/EpaFilters";
import TipoEpaFeature from "../ui/TipoEpaFeature";
import type { TipoEpaListRef } from "../ui/TipoEpaFeature";
import TipoCultivoEpaFeature from "../ui/TipoCultivoEpaFeature";
import type { TipoCultivoEpaListRef } from "../ui/TipoCultivoEpaFeature";
import Surface from "../ui/Surface";
import EpaPillToggle from "../ui/EpaPillToggle";
import type { EpaTab } from "../ui/EpaPillToggle";
import { useEpaList, useTipoEpaList, useTipoCultivoEpaList, useCreateEpa, useUpdateEpa } from "../hooks/useFitosanitario";
import { useFitosanitarioRealtime } from "../hooks/useFitosanitarioRealtime";
import type { TipoEpaEnum, Epa, CreateEpaInput } from "../models/types";

// Variants de animación simplificados
const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const hoverCard = {
  rest: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.01 },
};

export default function EpaListFeature() {
  // Estados de filtros
  const [q, setQ] = useState("");
  const [debouncedQ] = useDebounce(q, 400);
  const [tipoEpaFilter, setTipoEpaFilter] = useState<TipoEpaEnum | "todos">("todos");
  const [tipoCultivoEpaId, setTipoCultivoEpaId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<EpaTab>("epas");
  const [page, setPage] = useState(1);
  const limit = 12; // Items per page

  // Refs para sub-features
  const tipoEpaRef = useRef<TipoEpaListRef>(null);
  const tipoCultivoEpaRef = useRef<TipoCultivoEpaListRef>(null);

  // Estados de Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEpa, setSelectedEpa] = useState<Epa | null>(null);

  // Datos de listas para filtros
  const { data: tiposEpa = [] } = useTipoEpaList();
  const { data: tiposCultivoEpa = [] } = useTipoCultivoEpaList();

  // Mutations
  const createMutation = useCreateEpa();
  const updateMutation = useUpdateEpa();

  // Habilitar actualizaciones en tiempo real
  useFitosanitarioRealtime();

  // Calcular tipoId basado en el filtro de tabs
  const tipoId = useMemo(() => {
    if (tipoEpaFilter === "todos") return undefined;
    const tipo = tiposEpa.find(t => t.tipoEpaEnum === tipoEpaFilter);
    return tipo?.id;
  }, [tipoEpaFilter, tiposEpa]);

  // Hook de lista con filtros
  const { data, isLoading } = useEpaList({
    q: debouncedQ,
    tipoId,
    tipoCultivoEpaId,
    page,
    limit,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Handlers
  const handleViewDetail = useCallback((epa: Epa) => {
    setSelectedEpa(epa);
    setIsDetailOpen(true);
  }, []);

  const handleEdit = useCallback((epa: Epa) => {
    setSelectedEpa(epa);
    setIsFormOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    if (activeTab === "epas") {
      setSelectedEpa(null);
      setIsFormOpen(true);
    } else if (activeTab === "tipos-epa") {
      tipoEpaRef.current?.openCreateModal();
    } else if (activeTab === "tipos-cultivo") {
      tipoCultivoEpaRef.current?.openCreateModal();
    }
  }, [activeTab]);

  const handleFormSubmit = async (data: CreateEpaInput) => {
    try {
      if (selectedEpa) {
        await updateMutation.mutateAsync({ id: selectedEpa.id, input: data });
        toast.success("EPA actualizado correctamente");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("EPA creado correctamente");
      }
      setIsFormOpen(false);
      setSelectedEpa(null);
    } catch (error) {
      console.error("Error saving EPA:", error);
      toast.error("Error al guardar EPA");
    }
  };

  const getButtonLabel = () => {
    if (activeTab === 'epas') return 'Nueva EPA';
    if (activeTab === 'tipos-epa') return 'Nuevo Tipo EPA';
    return 'Nuevo Tipo Cultivo';
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Módulo Fitosanitario</h1>
        <p className="text-sm opacity-70">Administra EPAs, tipos de EPA y tipos de cultivo</p>
      </div>

      {/* PillToggle y botón de acción en la misma fila */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <EpaPillToggle value={activeTab} onChange={setActiveTab} />
        <Button
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          onPress={handleCreateNew}
        >
          {getButtonLabel()}
        </Button>
      </div>

      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              {activeTab === 'epas' && (
                <div className="space-y-6">
                  {/* Filtros */}
                  <EpaFilters 
                    q={q}
                    setQ={setQ}
                    tipoEpaFilter={tipoEpaFilter}
                    setTipoEpaFilter={setTipoEpaFilter}
                    tipoCultivoEpaId={tipoCultivoEpaId}
                    setTipoCultivoEpaId={setTipoCultivoEpaId}
                    tiposCultivoEpa={tiposCultivoEpa}
                  />

                  {/* Grid de EPAs */}
                  <motion.div initial="hidden" animate="show" variants={listStagger}>
                    {isLoading ? (
                      <div className="py-12 text-center text-default-500">
                        Cargando EPAs...
                      </div>
                    ) : items.length === 0 ? (
                      <Card className="border border-transparent shadow-none bg-transparent">
                        <CardBody className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4 text-default-500">
                                  <Search size={32} />
                              </div>
                              <p className="text-default-500 text-lg font-medium">
                              {debouncedQ || tipoId || tipoCultivoEpaId
                                  ? "No se encontraron EPAs con los filtros aplicados."
                                  : "No hay EPAs registrados aún."}
                              </p>
                              <p className="text-default-400 text-sm mt-1">
                                  Intenta ajustar los filtros o crea un nuevo registro.
                              </p>
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {items.map((epa) => (
                            <motion.div key={epa.id} variants={hoverCard} initial="rest" whileHover="hover">
                              <EpaCard
                                epa={epa}
                                onViewDetail={handleViewDetail}
                                onEdit={handleEdit}
                              />
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-8">
                            <Pagination
                              total={totalPages}
                              page={page}
                              onChange={setPage}
                              color="success"
                              showControls
                            />
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </div>
              )}
              {activeTab === 'tipos-epa' && <TipoEpaFeature ref={tipoEpaRef} />}
              {activeTab === 'tipos-cultivo' && <TipoCultivoEpaFeature ref={tipoCultivoEpaRef} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>

      {/* Modal Crear/Editar EPA */}
      <EpaForm
        epa={selectedEpa}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEpa(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Modal Ver Detalle EPA */}
      <Modal 
        isOpen={isDetailOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsDetailOpen(false);
            setSelectedEpa(null);
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Detalle de EPA</ModalHeader>
              <ModalBody>
                {selectedEpa && <EpaDetail epa={selectedEpa} />}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    onClose();
                    if (selectedEpa) handleEdit(selectedEpa);
                  }}
                >
                  Editar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}