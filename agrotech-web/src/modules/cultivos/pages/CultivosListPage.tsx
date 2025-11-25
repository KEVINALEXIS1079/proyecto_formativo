import { useMemo, useState } from "react";
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
  Select,
  SelectItem,
} from "@heroui/react";
import { Calendar, Pencil, Plus, Search, Trash2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCultivosList, useCultivoRemove, useCultivoFinalizar } from "../hooks/useCultivos";
import { useLotesList } from "../hooks/useLotes";
import { useLotesRealtime } from "../hooks/useLotesRealtime";
import { useCultivosRealtime } from "../hooks/useCultivosRealtime";
import { useTiposCultivoList, useTipoCultivoCreate } from "../hooks/useTiposCultivo";
import type { Cultivo } from "../model/types";

const CREATE_PATH = "/cultivos/crear";
const EDIT_PATH = (id: number) => `/cultivos/editar/${id}`;
const DETAIL_PATH = (id: number) => `/cultivos/detalle/${id}`;

const ESTADOS: Cultivo["estado"][] = ["activo", "inactivo"];
const estadoColor: Record<Cultivo["estado"], "warning" | "primary" | "success" | "danger"> = {
  activo: "success",
  inactivo: "danger",
};

export default function CultivosListPage() {
  const page = 1;
  const limit = 10;

  // filtros
  const [q, setQ] = useState("");
  const [loteId, setLoteId] = useState<number | undefined>();
  const [tipoCultivoId, setTipoCultivoId] = useState<number | undefined>();
  const [estado, setEstado] = useState<Cultivo["estado"] | "">("");

  // modal crear tipo cultivo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipoName, setModalTipoName] = useState("");

  // eliminar
  const [openDelete, setOpenDelete] = useState(false);
  const [rowDelete, setRowDelete] = useState<Cultivo | null>(null);

  const { data: cultivos = [], isLoading } = useCultivosList({
    page,
    limit,
    q,
    loteId,
    tipoCultivoId,
    estado: estado || undefined,
  });

  const { data: lotes = [] } = useLotesList();
  const { data: tiposCultivo = [] } = useTiposCultivoList();
  const createTipoMutation = useTipoCultivoCreate();

  // Habilitar actualizaciones en tiempo real para lotes
  useLotesRealtime();

  // Habilitar actualizaciones en tiempo real para cultivos
  useCultivosRealtime();

  const removeMutation = useCultivoRemove();
  const finalizarMutation = useCultivoFinalizar();

  const fmt = (s?: string) =>
    s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }) : "";

  // métricas
  const metrics = useMemo(() => {
    const total = cultivos.length;
    const activos = cultivos.filter((x) => x.estado === "activo").length;
    const inactivos = cultivos.filter((x) => x.estado === "inactivo").length;
    return { total, activos, inactivos };
  }, [cultivos]);

  const estadoOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...ESTADOS.map((e) => ({ key: e, label: e }))],
    []
  );

  const loteOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...lotes.map((l) => ({ key: l.id.toString(), label: l.nombre }))],
    [lotes]
  );

  const tipoCultivoOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...tiposCultivo.map((t) => ({ key: t.id.toString(), label: t.nombre }))],
    [tiposCultivo]
  );

  const openDeleteConfirm = (row: Cultivo) => {
    setRowDelete(row);
    setOpenDelete(true);
  };

  const submitDelete = async () => {
    if (!rowDelete) return;
    try {
      await removeMutation.mutateAsync(rowDelete.id);
      setOpenDelete(false);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar el cultivo");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Lista de cultivos</h2>
        <div className="flex gap-2">
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setIsModalOpen(true)}
            className="shadow-sm"
          >
            Nuevo tipo de cultivo
          </Button>
          <Button
            as={Link}
            to={CREATE_PATH}
            color="success"
            startContent={<Plus className="h-4 w-4" />}
            className="shadow-sm"
          >
            Nuevo cultivo
          </Button>
        </div>
      </div>

      {/* métricas */}
      <div className="grid grid-cols-3 gap-3">
        <Card shadow="sm"><CardBody><p>Total</p><p className="text-xl">{metrics.total}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Activos</p><p className="text-xl">{metrics.activos}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Inactivos</p><p className="text-xl">{metrics.inactivos}</p></CardBody></Card>
      </div>

      {/* filtros */}
      <Card shadow="sm">
        <CardBody className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            startContent={<Search className="h-4 w-4 text-foreground-500" />}
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            variant="bordered"
          />
          <Select
            label="Lote:"
            items={loteOptions}
            selectedKeys={new Set(loteId ? [loteId.toString()] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setLoteId(k === "" ? undefined : Number(k));
            }}
            placeholder="Filtrar por lote"
            variant="bordered"
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Select
            label="Tipo de Cultivo:"
            items={tipoCultivoOptions}
            selectedKeys={new Set(tipoCultivoId ? [tipoCultivoId.toString()] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setTipoCultivoId(k === "" ? undefined : Number(k));
            }}
            placeholder="Filtrar por tipo de cultivo"
            variant="bordered"
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Select
            label="Estado:"
            items={estadoOptions}
            selectedKeys={new Set(estado ? [estado] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setEstado(k === "" ? "" : (k as Cultivo["estado"]));
            }}
            placeholder="Filtrar por estado"
            variant="bordered"
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
        </CardBody>
      </Card>

      {/* listado */}
      {isLoading ? (
        <p>Cargando…</p>
      ) : cultivos.length === 0 ? (
        <Card><CardBody>No se encontraron cultivos</CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cultivos.map((c) => {
            const color = estadoColor[c.estado] ?? "primary";
            return (
              <Card key={c.id} className="shadow-lg hover:shadow-xl rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 transition-all duration-300 hover:scale-105">
                <CardBody className="p-6 space-y-4">
                  {c.imagen && (
                    <img src={c.imagen} alt={c.nombre} className="w-full h-40 object-cover rounded-lg shadow-md" />
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-green-600">🌱</span>
                        {c.nombre}
                      </h3>
                      <Chip size="sm" color={color} variant="flat">{c.estado}</Chip>
                    </div>
                    <div className="max-h-16 overflow-hidden text-sm text-gray-600 break-words">
                      {c.descripcion || 'Sin descripción'}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Lote: {c.lote?.nombre || 'Sin lote'} - Sublote: {c.sublote?.nombre || 'Sin sublote'} - Tipo: {c.tipoCultivo.nombre}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Inicio: {fmt(c.fechaInicio)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>Siembra: {fmt(c.fechaSiembra)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-200">
                    <Button as={Link} to={DETAIL_PATH(c.id)} size="sm" variant="bordered" className="shadow-sm">Ver detalle</Button>
                    <Button as={Link} to={EDIT_PATH(c.id)} size="sm" startContent={<Pencil className="h-4 w-4" />} className="shadow-sm">Editar</Button>
                    {c.estado === 'activo' && (
                      <Button size="sm" color="warning" startContent={<CheckCircle className="h-4 w-4" />} onPress={() => finalizarMutation.mutate(c.id)} className="shadow-sm">Finalizar</Button>
                    )}
                    <Button size="sm" color="danger" startContent={<Trash2 className="h-4 w-4" />} onPress={() => openDeleteConfirm(c)} className="shadow-sm">Borrar</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* modal delete */}
      <Modal isOpen={openDelete} onOpenChange={setOpenDelete}>
        <ModalContent>
          <ModalHeader>Eliminar cultivo</ModalHeader>
          <ModalBody>
            ¿Seguro que deseas eliminar <strong>{rowDelete?.nombre}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpenDelete(false)}>Cancelar</Button>
            <Button color="danger" onPress={submitDelete}>Eliminar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* modal crear tipo cultivo */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
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
                <Button variant="flat" onPress={onClose}>Cancelar</Button>
                <Button
                  color="primary"
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
    </div>
  );
}