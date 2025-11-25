import { useEffect, useMemo, useState } from "react";
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
import { Calendar, Clock4, HandCoins, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Actividad } from "../model/types";
import { listActividad } from "../api/list";
import { removeActividad } from "../api/remove";

const CREATE_PATH = "/actividades/crear";
const EDIT_PATH = (id: number) => `/actividades/editar/${id}`;

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const ESTADOS: Actividad["estado_actividad"][] = ["Pendiente", "En progreso", "Completada", "Cancelada"];
const estadoColor: Record<Actividad["estado_actividad"], "warning" | "primary" | "success" | "danger"> = {
  Pendiente: "warning",
  "En progreso": "primary",
  Completada: "success",
  Cancelada: "danger",
};

export default function ListaPage() {
  const [list, setList] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<Actividad["estado_actividad"] | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // eliminar
  const [openDelete, setOpenDelete] = useState(false);
  const [rowDelete, setRowDelete] = useState<Actividad | null>(null);

  useEffect(() => {
    listActividad()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (s?: string) =>
    s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }) : "";

  // métricas
  const metrics = useMemo(() => {
    const total = list.length;
    const pendientes = list.filter((x) => x.estado_actividad === "Pendiente").length;
    const enProgreso = list.filter((x) => x.estado_actividad === "En progreso").length;
    const completadas = list.filter((x) => x.estado_actividad === "Completada").length;
    const canceladas = list.filter((x) => x.estado_actividad === "Cancelada").length;
    const horas = list.reduce((acc, x) => acc + Number(x.tiempo_actividad || 0), 0);
    const costo = list.reduce((acc, x) => acc + Number(x.costo_mano_obra_actividad || 0), 0);
    return { total, pendientes, enProgreso, completadas, canceladas, horas, costo };
  }, [list]);

  const estadoOptions = useMemo(
    () => [{ key: "", label: "Todos" }, ...ESTADOS.map((e) => ({ key: e, label: e }))],
    []
  );

  // filtrar
  const filtered = useMemo(() => {
    return list.filter((x) => {
      const texto =
        (x.nombre_actividad || "") +
        " " +
        (x.descripcion_actividad || "") +
        " " +
        (x.estado_actividad || "");
      const matchQ = q.trim() ? texto.toLowerCase().includes(q.trim().toLowerCase()) : true;
      const matchEstado = estado ? x.estado_actividad === estado : true;

      const f = (s?: string) => (s ? new Date(s).getTime() : undefined);
      const d = f(x.fecha_actividad);
      const dDesde = f(desde);
      const dHasta = f(hasta);

      const matchFecha =
        d === undefined ||
        ((dDesde === undefined || d >= dDesde) && (dHasta === undefined || d <= dHasta));

      return matchQ && matchEstado && matchFecha;
    });
  }, [list, q, estado, desde, hasta]);

  const openDeleteConfirm = (row: Actividad) => {
    setRowDelete(row);
    setOpenDelete(true);
  };

  const submitDelete = async () => {
    if (!rowDelete) return;
    try {
      await removeActividad(rowDelete.id_actividad_pk); // 🔥 elimina en backend (soft delete)
      setList((prev) => prev.filter((x) => x.id_actividad_pk !== rowDelete.id_actividad_pk)); // 🔥 elimina en frontend
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar la actividad");
    } finally {
      setOpenDelete(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Lista de actividades</h2>
        <Button
          as={Link}
          to={CREATE_PATH}
          color="success"
          startContent={<Plus className="h-4 w-4" />}
          className="shadow-sm"
        >
          Nueva actividad
        </Button>
      </div>

      {/* métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card shadow="sm"><CardBody><p>Total</p><p className="text-xl">{metrics.total}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Pendientes</p><p className="text-xl">{metrics.pendientes}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>En progreso</p><p className="text-xl">{metrics.enProgreso}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Completadas</p><p className="text-xl">{metrics.completadas}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Canceladas</p><p className="text-xl">{metrics.canceladas}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Horas</p><p className="text-xl">{metrics.horas}</p></CardBody></Card>
        <Card shadow="sm"><CardBody><p>Costo</p><p className="text-xl">{COP.format(metrics.costo)}</p></CardBody></Card>
      </div>

      {/* filtros */}
      <Card shadow="sm">
        <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            startContent={<Search className="h-4 w-4 text-foreground-500" />}
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            variant="bordered"
          />
          <Select
            items={estadoOptions}
            selectedKeys={new Set(estado ? [estado] : [""])}
            onSelectionChange={(keys) => {
              const k = (keys as Set<string>).values().next().value as string;
              setEstado(k === "" ? "" : (k as Actividad["estado_actividad"]));
            }}
            placeholder="Estado"
            variant="bordered"
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} variant="bordered" />
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} variant="bordered" />
        </CardBody>
      </Card>

      {/* listado */}
      {loading ? (
        <p>Cargando…</p>
      ) : filtered.length === 0 ? (
        <Card><CardBody>No se encontraron actividades</CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const color = estadoColor[a.estado_actividad as Actividad["estado_actividad"]] ?? "primary";
            return (
              <Card key={a.id_actividad_pk} shadow="sm" className="hover:shadow-md transition">
                <CardBody className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{a.nombre_actividad}</h3>
                      <p className="text-sm text-foreground-500 line-clamp-2">{a.descripcion_actividad}</p>
                    </div>
                    <Chip size="sm" color={color} variant="flat">{a.estado_actividad}</Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{fmt(a.fecha_actividad)}</span></div>
                    <div className="flex items-center gap-2"><Clock4 className="h-4 w-4" /><span>{a.tiempo_actividad} h</span></div>
                    <div className="flex items-center gap-2"><HandCoins className="h-4 w-4" /><span>{COP.format(Number(a.costo_mano_obra_actividad))}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{fmt(a.fecha_inicio_actividad)} — {fmt(a.fecha_fin_actividad)}</span></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button as={Link} to={EDIT_PATH(a.id_actividad_pk)} size="sm" startContent={<Pencil className="h-4 w-4" />}>Editar</Button>
                    <Button size="sm" color="danger" startContent={<Trash2 className="h-4 w-4" />} onPress={() => openDeleteConfirm(a)}>Borrar</Button>
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
          <ModalHeader>Eliminar actividad</ModalHeader>
          <ModalBody>
            ¿Seguro que deseas eliminar <strong>{rowDelete?.nombre_actividad}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpenDelete(false)}>Cancelar</Button>
            <Button color="danger" onPress={submitDelete}>Eliminar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
