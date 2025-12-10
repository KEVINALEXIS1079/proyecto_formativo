import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { Plus, FileText, FileSpreadsheet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useActividades } from "../hooks/useActividades";
import ActividadCard from "../widgets/ActividadCard";
import CreateActivityModal from "../ui/CreateActivityModal";
import EditActivityModal from "../ui/EditActivityModal";
import GestionarActividadModal from "../ui/GestionarActividadModal";
import FinalizeActivityModal from "../ui/FinalizeActivityModal";
import PillToggle from "../ui/PillToggle";
import Surface from "../ui/Surface";
import HistorialActividadesTable from "../widgets/HistorialActividadesTable";
import ActividadFilters from "../widgets/ActividadFilters";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import toast from "react-hot-toast";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const TIPOS = ["CREACION", "MANTENIMIENTO", "FINALIZACION"];

export default function ListaPage() {
  // State
  const [activeTab, setActiveTab] = useState<"pendientes" | "realizadas" | "historial">(
    "pendientes"
  );
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState<any>(null);
  const [editActividad, setEditActividad] = useState<any>(null);
  const [actividadFinalizar, setActividadFinalizar] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Hooks
  const { data: list = [], isLoading } = useActividades();

  // Metrics
  const metrics = useMemo(() => {
    const total = list.length;
    const horas = list.reduce(
      (acc, x) => acc + Number(x.horasActividad || 0),
      0
    );
    const costo = list.reduce(
      (acc, x) => acc + Number(x.costoManoObra || 0),
      0
    );
    return { total, horas, costo };
  }, [list]);

  // Filter Logic
  const filtered = useMemo(() => {
    return list.filter((x) => {
      const texto =
        (x.nombre || "") +
        " " +
        (x.descripcion || "") +
        " " +
        (x.subtipo || "");
      const matchQ = q.trim()
        ? texto.toLowerCase().includes(q.trim().toLowerCase())
        : true;
      const matchTipo = tipo ? x.tipo === tipo : true;

      const f = (s?: string) => (s ? new Date(s).getTime() : undefined);
      const d = f(x.fecha);
      const dDesde = f(desde);
      const dHasta = f(hasta);

      const matchFecha =
        d === undefined ||
        ((dDesde === undefined || d >= dDesde) &&
          (dHasta === undefined || d <= dHasta));

      // Filter by Tab
      let matchTab = true;
      if (activeTab === 'pendientes') {
        matchTab = x.estado === 'Pendiente' || x.estado === 'PENDIENTE';
      } else if (activeTab === 'realizadas') {
        matchTab = x.estado === 'Finalizada' || x.estado === 'FINALIZADA';
      }

      return matchQ && matchTipo && matchFecha && matchTab;
    });
  }, [list, q, tipo, desde, hasta, activeTab]);

  // Export handlers
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      exportToPDF({ actividades: filtered });
      toast.success("PDF exportado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      exportToExcel({ actividades: filtered });
      toast.success("Excel exportado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestión de Actividades</h1>
        <p className="text-sm opacity-70">Administra y registra las actividades agrícolas</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillToggle
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          options={[
            { value: "pendientes", label: "Pendientes" },
            { value: "realizadas", label: "Realizadas" },
            { value: "historial", label: "Historial Detallado" },
          ]}
        />
        <div className="flex gap-2">
          {activeTab === "historial" && (
            <>
              <Button
                color="danger"
                variant="flat"
                startContent={<FileText className="h-4 w-4" />}
                onPress={handleExportPDF}
                isLoading={isExporting}
                size="sm"
              >
                Exportar PDF
              </Button>
              <Button
                color="success"
                variant="flat"
                startContent={<FileSpreadsheet className="h-4 w-4" />}
                onPress={handleExportExcel}
                isLoading={isExporting}
                size="sm"
              >
                Exportar Excel
              </Button>
            </>
          )}
          <Button
            color="success"
            startContent={<Plus className="h-4 w-4" />}
            className="font-medium text-black shadow-lg shadow-success/20"
            onPress={() => setIsCreateModalOpen(true)}
          >
            Nueva actividad
          </Button>
        </div>
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
              {activeTab === "pendientes" || activeTab === "realizadas" ? (
                <div className="space-y-5">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Card shadow="sm">
                      <CardBody>
                        <p className="text-sm text-gray-500">Total {activeTab}</p>
                        <p className="text-2xl font-bold">{metrics.total}</p>
                      </CardBody>
                    </Card>
                    <Card shadow="sm">
                      <CardBody>
                        <p className="text-sm text-gray-500">Horas Totales</p>
                        <p className="text-2xl font-bold">{metrics.horas}</p>
                      </CardBody>
                    </Card>
                    <Card shadow="sm">
                      <CardBody>
                        <p className="text-sm text-gray-500">{activeTab === 'pendientes' ? 'Costo Estimado' : 'Costo Mano de Obra'}</p>
                        <p className="text-2xl font-bold">{COP.format(metrics.costo)}</p>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Filters */}
                  <ActividadFilters
                    q={q}
                    setQ={setQ}
                    tipo={tipo}
                    setTipo={setTipo}
                    desde={desde}
                    setDesde={setDesde}
                    hasta={hasta}
                    setHasta={setHasta}
                    tipos={TIPOS}
                  />

                  {/* List */}
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <p>Cargando actividades...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      No se encontraron actividades {activeTab === 'pendientes' ? 'pendientes' : 'realizadas'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filtered.map((actividad) => (
                        <ActividadCard
                          key={actividad.id}
                          actividad={actividad}
                          onGestionar={(act) => setSelectedActividad(act)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* History Table */
                isLoading ? (
                  <div className="flex justify-center p-8">
                    <p>Cargando historial...</p>
                  </div>
                ) : (
                  <HistorialActividadesTable actividades={list.filter(x => x.estado === 'FINALIZADA')} />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>

      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <GestionarActividadModal
        isOpen={!!selectedActividad}
        onClose={() => setSelectedActividad(null)}
        actividad={selectedActividad}
        onEdit={(act) => setEditActividad(act)}
        onFinalize={(act) => {
          setSelectedActividad(null); // Close detail modal
          setActividadFinalizar(act); // Open finalize modal
        }}
      />
      <EditActivityModal
        isOpen={!!editActividad}
        onClose={() => setEditActividad(null)}
        actividad={editActividad}
      />
      <FinalizeActivityModal
        isOpen={!!actividadFinalizar}
        onClose={() => setActividadFinalizar(null)}
        actividad={actividadFinalizar}
      />
    </div>
  );
}
