import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import Surface from "../ui/Surface";
import PillToggle, { type CultivosTab } from "../ui/PillToggle";
import { Calendar, Plus, MapPin, Eye, Sprout, ChevronLeft, ChevronRight } from "lucide-react";
import { useCultivosList, useCultivoHistorial } from "../hooks/useCultivos";
import { useLotesList, useSublotesList } from "../hooks/useLotes";
import { useLotesRealtime } from "../hooks/useLotesRealtime";
import { useCultivosRealtime } from "../hooks/useCultivosRealtime";
import { useTiposCultivoList, useTipoCultivoCreate } from "../hooks/useTiposCultivo";
import { useCultivoCreate } from "../hooks/useCultivos";
import type { Cultivo } from "../model/types";

import CultivoForm from "../widgets/CultivoForm";
import { CultivoDetailModal } from "../widgets/CultivoDetailModal";
import CultivosFilters from "../widgets/CultivosFilters";
import CultivosHistorialFilters from "../widgets/CultivosHistorialFilters";

const ESTADOS: Cultivo["estado"][] = ["activo", "inactivo", "finalizado"];
const estadoColor: Record<Cultivo["estado"], "warning" | "primary" | "success" | "danger"> = {
  activo: "success",
  inactivo: "danger",
  finalizado: "primary",
};

export default function CultivosListPage() {
  /* State */
  const [page, setPage] = useState(1);
  const limit = 10;

  const [activeTab, setActiveTab] = useState<CultivosTab>("cultivos");
  const [q, setQ] = useState("");
  const [loteId, setLoteId] = useState<number | undefined>();
  const [tipoCultivoNombre, setTipoCultivoNombre] = useState<string | undefined>();
  const [estado, setEstado] = useState<Cultivo["estado"] | "">("");

  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [modalTipoName, setModalTipoName] = useState("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const handleCreate = () => {
    setSelectedCultivo(null);
    setIsEditMode(true);
    setIsManageModalOpen(true);
  };

  const handleManage = (cultivo: Cultivo) => {
    setDetailId(cultivo.id);
  };

  /* Query */
  const { data: cultivos = [], isLoading } = useCultivosList({
    page,
    limit,
    q,
    loteId,
    tipoCultivoNombre,
    estado: estado || undefined,
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, loteId, tipoCultivoNombre, estado]);

  const { data: lotes = [] } = useLotesList();
  /* ... hooks ... */
  const { data: sublotes = [] } = useSublotesList(loteId || 0);
  const { data: tiposCultivo = [] } = useTiposCultivoList();
  const createTipoMutation = useTipoCultivoCreate();
  const createCultivoMutation = useCultivoCreate();
  const { data: historial = [], isLoading: isLoadingHist } = useCultivoHistorial({ limit: 200 });
  const [histQ, setHistQ] = useState("");
  const [histLoteId, setHistLoteId] = useState<number | undefined>();
  const [histSubLoteId, setHistSubLoteId] = useState<number | undefined>();
  const [histTipoNombre, setHistTipoNombre] = useState<string | undefined>();
  const [histPage, setHistPage] = useState(1);
  const pageSizeHist = 10;
  const { data: histSubLotes = [] } = useSublotesList(histLoteId || 0);

  useLotesRealtime();
  useCultivosRealtime();

  /* ... rest of logic ... */
  // SKIP to return block modifications
  /* NOTE: Since I am replacing a huge chunk by line numbers, I must be careful.
     Lines 38 to 60 contain the Logic I want to change.
     I also need to target the JSX down below.
     I will split this tool call into 2 chunks if possible or use MultiReplace.
     I'll use MultiReplace for safety.
  */


  const filteredHistorial = useMemo(() => {
    return (historial || []).filter((h: any) => {
      const cultivoNombre = h.cultivo?.nombreCultivo || h.cultivo?.nombre || "";
      const subLoteNombre = h.cultivo?.subLote?.nombre || h.cultivo?.sublote?.nombre || "";
      const tipoNombre =
        typeof h.cultivo?.tipoCultivo === "string" ? h.cultivo?.tipoCultivo : h.cultivo?.tipoCultivo?.nombre || "";
      const matchText =
        !histQ ||
        cultivoNombre.toLowerCase().includes(histQ.toLowerCase()) ||
        subLoteNombre.toLowerCase().includes(histQ.toLowerCase()) ||
        tipoNombre.toLowerCase().includes(histQ.toLowerCase()) ||
        (h.motivo || "").toLowerCase().includes(histQ.toLowerCase());

      const matchLote = !histLoteId || h.cultivo?.lote?.id === histLoteId;
      const matchSub = !histSubLoteId || h.cultivo?.subLote?.id === histSubLoteId || h.cultivo?.sublote?.id === histSubLoteId;
      const matchTipo = !histTipoNombre || tipoNombre.toLowerCase() === histTipoNombre.toLowerCase();
      return matchText && matchLote && matchSub && matchTipo;
    });
  }, [historial, histQ, histLoteId, histSubLoteId, histTipoNombre]);

  const paginatedHistorial = useMemo(() => {
    const start = (histPage - 1) * pageSizeHist;
    return filteredHistorial.slice(start, start + pageSizeHist);
  }, [filteredHistorial, histPage]);

  const totalHistPages = useMemo(() => Math.max(1, Math.ceil(filteredHistorial.length / pageSizeHist)), [filteredHistorial.length]);

  useEffect(() => {
    setHistPage(1);
  }, [histQ, histLoteId, histSubLoteId, histTipoNombre]);

  const fmt = (s?: string) =>
    s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }) : "N/A";

  const metrics = useMemo(() => {
    const total = cultivos.length;
    const activos = cultivos.filter((x) => x.estado === "activo").length;
    const inactivos = cultivos.filter((x) => x.estado === "inactivo").length;
    const finalizados = cultivos.filter((x) => x.estado === "finalizado").length;
    return { total, activos, inactivos, finalizados };
  }, [cultivos]);

  const estadoOptions = useMemo(() => [{ key: "", label: "Todos" }, ...ESTADOS.map((e) => ({ key: e, label: e }))], []);
  const loteOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...lotes.map((l) => ({ key: l.id.toString(), label: l.nombre }))],
    [lotes]
  );
  const tipoCultivoOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...tiposCultivo.map((t) => ({ key: t.nombre, label: t.nombre }))],
    [tiposCultivo]
  );





  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestión de Cultivos</h1>
        <p className="text-sm opacity-70">Administra tus cultivos y el historial de cambios</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillToggle value={activeTab} onChange={setActiveTab} />
        <div className="flex gap-2">
          <Button color="success" className="font-medium text-black" startContent={<Plus className="h-4 w-4" />} onPress={() => setIsTipoModalOpen(true)}>
            Nuevo tipo
          </Button>
          <Button
            color="success"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleCreate}
            className="font-medium text-black shadow-lg shadow-success/20"
          >
            Nuevo cultivo
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
              {activeTab === "cultivos" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card shadow="sm">
                      <CardBody className="flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-gray-500">Total cultivos</p>
                        <p className="text-2xl font-bold">{metrics.total}</p>
                      </CardBody>
                    </Card>
                    <Card shadow="sm">
                      <CardBody className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Activos</p>
                          <p className="text-2xl font-bold text-green-600">{metrics.activos}</p>
                        </div>
                        <Chip color="success" variant="flat" size="sm">
                          activos
                        </Chip>
                      </CardBody>
                    </Card>
                    <Card shadow="sm">
                      <CardBody className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Finalizados</p>
                          <p className="text-2xl font-bold text-primary">{metrics.finalizados}</p>
                        </div>
                        <Chip color="primary" variant="flat" size="sm">
                          finalizados
                        </Chip>
                      </CardBody>
                    </Card>
                  </div>

                  <CultivosFilters
                    q={q}
                    setQ={setQ}
                    loteId={loteId}
                    setLoteId={setLoteId}
                    tipoCultivoNombre={tipoCultivoNombre}
                    setTipoCultivoNombre={setTipoCultivoNombre}
                    estado={estado}
                    setEstado={setEstado}
                    loteOptions={loteOptions}
                    tipoCultivoOptions={tipoCultivoOptions}
                    estadoOptions={estadoOptions}
                  />

                  {isLoading ? (
                    <Card>
                      <CardBody className="flex justify-center items-center py-8">
                        <Spinner color="success" label="Cargando cultivos..." />
                      </CardBody>
                    </Card>
                  ) : cultivos.length === 0 ? (
                    <Card>
                      <CardBody>No se encontraron cultivos</CardBody>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {cultivos.map((c) => {
                          const color = estadoColor[c.estado] ?? "primary";
                          const tipoNombre = typeof c.tipoCultivo === "string" ? c.tipoCultivo : c.tipoCultivo?.nombre;
                          const loteNombre =
                            c.lote?.nombre ||
                            (c.idLote && lotes.find((l: any) => l.id === c.idLote)?.nombre) ||
                            "N/A";
                          const subloteNombre =
                            c.sublote?.nombre ||
                            (c.idSublote && sublotes?.find((s: any) => s.id === c.idSublote)?.nombre) ||
                            "N/A";
                          return (
                            <Card key={c.id} className="shadow-md border border-gray-200 rounded-2xl">
                              <CardBody className="p-0 space-y-3">
                                <div className="w-full h-40 bg-gray-100 rounded-t-2xl border-b border-gray-100 flex items-center justify-center overflow-hidden">
                                  {c.imagen ? (
                                    <img
                                      src={c.imagen}
                                      alt={c.nombre}
                                      className="w-full h-full object-cover transition-transform hover:scale-105"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-gray-50');
                                      }}
                                    />
                                  ) : (
                                    <Sprout className="h-12 w-12 text-gray-300" />
                                  )}
                                </div>

                                <div className="px-5 pt-2 pb-5 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <h3 className="text-lg font-semibold text-gray-800">{c.nombre}</h3>
                                      <div className="flex flex-wrap gap-2">
                                        <Chip size="sm" variant="flat" color="success">
                                          {tipoNombre || "Tipo de cultivo"}
                                        </Chip>
                                      </div>
                                    </div>
                                    <Chip size="sm" color={color} variant="flat">
                                      {c.estado}
                                    </Chip>
                                  </div>

                                  <p className="text-sm text-gray-600 line-clamp-2 h-10">{c.descripcion || "Sin descripción"}</p>

                                  <div className="text-sm text-gray-700 space-y-1">
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-blue-500" />
                                      {loteNombre} {subloteNombre !== "N/A" ? `· ${subloteNombre}` : ""}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-indigo-500" />
                                      Inicio: {fmt(c.fechaInicio)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-green-500" />
                                      Siembra: {fmt(c.fechaSiembra)}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <div>
                                      <p className="text-xs text-gray-500">Inversión Acumulada</p>
                                      <p className="text-base font-semibold text-gray-800">
                                        {c.costoTotal !== undefined && c.costoTotal !== null
                                          ? c.costoTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                                          : "$ 0"}
                                      </p>
                                    </div>
                                    <Button size="sm" color="success" className="text-black" isIconOnly variant="solid" onPress={() => handleManage(c)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex justify-center items-center gap-4 py-4">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => setPage(p => Math.max(1, p - 1))}
                          isDisabled={page <= 1}
                        >
                          <ChevronLeft />
                        </Button>
                        <span className="text-sm font-medium text-gray-600">Página {page}</span>
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => setPage(p => p + 1)}
                          isDisabled={cultivos.length < limit}
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "historial" && (
                <Card shadow="none">
                  <CardBody className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Bitacora de cambios recientes</p>
                      <h3 className="text-xl font-semibold text-gray-800">Historial de cultivos</h3>
                    </div>

                    <CultivosHistorialFilters
                      q={histQ}
                      setQ={setHistQ}
                      loteId={histLoteId}
                      setLoteId={(val) => {
                        setHistLoteId(val);
                        setHistSubLoteId(undefined);
                      }}
                      subLoteId={histSubLoteId}
                      setSubLoteId={setHistSubLoteId}
                      tipoCultivoNombre={histTipoNombre}
                      setTipoCultivoNombre={setHistTipoNombre}
                      loteOptions={[{ key: "", label: "Todos" }, ...lotes.map((l: any) => ({ key: String(l.id), label: l.nombre }))]}
                      subLoteOptions={[{ key: "", label: "Todos" }, ...histSubLotes.map((s: any) => ({ key: String(s.id), label: s.nombre }))]}
                      tipoCultivoOptions={[{ key: "", label: "Todos" }, ...tiposCultivo.map((t: any) => ({ key: t.nombre, label: t.nombre }))]}
                    />

                    {isLoadingHist ? (
                      <div className="flex justify-center p-4">
                        <Spinner color="success" label="Cargando historial..." />
                      </div>
                    ) : filteredHistorial.length === 0 ? (
                      <p className="text-sm text-gray-600">No hay cambios registrados.</p>
                    ) : (
                      <div className="space-y-3">
                        {paginatedHistorial.map((h) => {
                          const formatCampo = (campo: string) => {
                            if (campo === "loteId") return "Lote";
                            if (campo === "subLoteId") return "Sublote";
                            if (campo === "imgCultivo" || campo === "img") return "Imagen";
                            return campo;
                          };
                          const formatValor = (campo: string, valor: any) => {
                            if (campo === "loteId") {
                              const nombreLote = lotes.find((l: any) => l.id === Number(valor))?.nombre;
                              return nombreLote ? nombreLote : valor;
                            }
                            if (campo === "subLoteId") {
                              const nombreSub =
                                histSubLotes.find((s: any) => s.id === Number(valor))?.nombre || (h as any).cultivo?.subLote?.nombre;
                              return nombreSub ? nombreSub : valor;
                            }
                            if (campo === "imgCultivo" || campo === "img") return "Imagen subida";
                            return valor;
                          };
                          const action =
                            h.cambios && Object.keys(h.cambios).length === 1 && (h.cambios as any).estado
                              ? "Cambio de estado"
                              : h.cambios && Object.keys(h.cambios).length > 0
                                ? "Edición"
                                : "Registro";
                          const fecha = new Date(h.createdAt).toLocaleString("es-CO");
                          const usuarioNombre =
                            (h as any).usuario?.nombre || (h as any).usuario?.username || (h as any).usuario?.email || `Usuario ${h.usuarioId}`;
                          const cultivoNombre =
                            (h as any).cultivo?.nombreCultivo || (h as any).cultivo?.nombre || `Cultivo ${h.cultivoId}`;
                          const cambios = h.cambios ? Object.entries(h.cambios).slice(0, 3) : [];
                          return (
                            <Card key={h.id} shadow="none" className="border border-gray-200/80 rounded-xl">
                              <CardBody className="p-5 space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500">{fecha}</p>
                                    <h4 className="text-lg font-semibold text-gray-800">{cultivoNombre}</h4>
                                    <p className="text-sm text-gray-600">
                                      {action} · por {usuarioNombre}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="flat" color="primary" onPress={() => setDetailId(h.cultivoId)}>
                                    Ver detalle
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-700">Motivo: {h.motivo}</p>
                                {cambios.length > 0 && (
                                  <div className="text-xs text-gray-700 bg-gray-50 rounded-lg border border-gray-100 p-3 space-y-1">
                                    {cambios.map(([campo, cambio]) => (
                                      <div key={campo} className="flex justify-between gap-2">
                                        <span className="font-semibold text-gray-600">{formatCampo(campo)}</span>
                                        <span className="text-gray-600">
                                          {String(formatValor(campo, (cambio as any).previo) ?? "-")} →{" "}
                                          <strong>{String(formatValor(campo, (cambio as any).nuevo) ?? "-")}</strong>
                                        </span>
                                      </div>
                                    ))}
                                    {h.cambios && Object.keys(h.cambios).length > cambios.length && (
                                      <p className="text-[11px] text-gray-500">...otros cambios</p>
                                    )}
                                  </div>
                                )}
                              </CardBody>
                            </Card>
                          );
                        })}
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-gray-500">
                            Página {histPage} de {totalHistPages} ({filteredHistorial.length} cambios)
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="light"
                              isDisabled={histPage <= 1}
                              onPress={() => setHistPage((p) => Math.max(1, p - 1))}
                            >
                              Anterior
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              isDisabled={histPage >= totalHistPages}
                              onPress={() => setHistPage((p) => Math.min(totalHistPages, p + 1))}
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>



      <Modal isOpen={isTipoModalOpen} onOpenChange={setIsTipoModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Crear nuevo tipo de cultivo</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  value={modalTipoName}
                  onChange={(e) => setModalTipoName(e.target.value)}
                  placeholder="Nombre del tipo de cultivo"
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="success"
                  className="text-black font-semibold"
                  onPress={async () => {
                    if (!modalTipoName.trim()) return;
                    try {
                      await createTipoMutation.mutateAsync({ nombre: modalTipoName });
                      setModalTipoName("");
                      onClose();
                    } catch (error) {
                      console.error("Error creando tipo:", error);
                    }
                  }}
                  isLoading={createTipoMutation.isPending}
                  isDisabled={!modalTipoName.trim()}
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isManageModalOpen}
        onOpenChange={(v) => {
          setIsManageModalOpen(v);
          if (!v) {
            setSelectedCultivo(null);
            setIsEditMode(false);
          }
        }}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
        }}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b pb-4">
                {selectedCultivo
                  ? isEditMode
                    ? "Editar información del cultivo"
                    : "Detalles del cultivo"
                  : "Registrar nuevo cultivo"}
              </ModalHeader>
              <ModalBody className="py-6">
                <CultivoForm
                  initialData={selectedCultivo}
                  readOnly={!isEditMode}
                  onToggleEdit={() => setIsEditMode(true)}
                  onSubmit={async (data) => {
                    try {
                      // Map Tipo Cultivo ID to Name if needed (Backend expects String Name or ID? DTO says string)
                      // However, if we sent ID, the backend generic ILIKE filter suggests it wants a string.
                      // Let's ensure we send the name if types are objects. 
                      // Form uses `tipoCultivoId`.
                      const selectedTipo = tiposCultivo.find((t) => t.id === Number(data.tipoCultivoId));
                      const tipoNombre = selectedTipo ? selectedTipo.nombre : String(data.tipoCultivoId);

                      await createCultivoMutation.mutateAsync({
                        nombre: data.nombre,
                        tipoCultivo: tipoNombre,
                        descripcion: data.descripcion,
                        idLote: data.loteId ? Number(data.loteId) : undefined,
                        idSublote: data.subloteId ? Number(data.subloteId) : undefined,
                        img: data.imagenFile,
                        estado: data.estado,
                        fechaSiembra: data.fechaSiembra || data.fechaInicio,
                        fechaFinalizacion: data.fechaFin
                      });
                      onClose();
                    } catch (error) {
                      console.error("Error al crear cultivo:", error);
                      // Ideally show a toast/alert here
                    }
                  }}
                  onCancel={() => {
                    if (isEditMode && selectedCultivo) {
                      setIsEditMode(false);
                    } else {
                      onClose();
                    }
                  }}
                  hideFooter={true}
                />
              </ModalBody>
              {!(!isEditMode && selectedCultivo) && (
                <ModalFooter className="border-t py-4 bg-gray-50/50">
                  <Button color="danger" variant="light" onPress={() => {
                    if (isEditMode && selectedCultivo) {
                      setIsEditMode(false);
                    } else {
                      onClose();
                    }
                  }}>
                    Cancelar
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    form="cultivo-form"
                    className="text-black font-semibold shadow-md"
                  >
                    Guardar Modelo
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>

      <CultivoDetailModal
        cultivoId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(cultivo) => {
          setDetailId(null);
          setSelectedCultivo(cultivo);
          setIsEditMode(true);
          setIsManageModalOpen(true);
        }}
      />
    </div>
  );
}
