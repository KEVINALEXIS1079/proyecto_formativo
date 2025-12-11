import { Button, Card, CardBody, CardHeader, Spacer, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Textarea, Spinner } from "@heroui/react";
import { Edit, Leaf, Calendar, MapPin, DollarSign, TrendingUp, TrendingDown, Activity, Sprout } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCultivoDetail, useCultivoUpdate } from "../hooks/useCultivos";
import { useCultivosRealtime } from "../hooks/useCultivosRealtime";
import type { EstadoCultivo } from "../model/types";
import { useState } from "react";
import { toast } from "react-toastify";

const EDIT_PATH = (id: number) => `/cultivos/editar/${id}`;

export default function CultivoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cultivoId = Number(id);

  const { data: cultivo, isLoading } = useCultivoDetail(cultivoId);
  const updateMutation = useCultivoUpdate();
  const [openEstadoModal, setOpenEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCultivo>("activo");
  const [motivo, setMotivo] = useState("");

  // Habilitar actualizaciones en tiempo real para cultivos
  useCultivosRealtime();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-center">
        <Spinner color="success" label="Cargando..." size="lg" />
      </div>
    </div>
  );
  if (!cultivo) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🌱</div>
        <p className="text-xl font-semibold text-gray-800">Cultivo no encontrado</p>
      </div>
    </div>
  );

  const fmt = (s?: string) =>
    s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }) : "N/A";



  const openEstado = () => {
    if (!cultivo) return;
    setNuevoEstado((cultivo.estado as EstadoCultivo) ?? "activo");
    setMotivo("");
    setOpenEstadoModal(true);
  };

  const submitCambioEstado = async () => {
    if (!cultivo) return;
    if (!motivo.trim()) {
      toast.error("Debes ingresar un motivo");
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: cultivo.id, dto: { estado: nuevoEstado, motivo } });
      setOpenEstadoModal(false);
      toast.success("Estado actualizado");
    } catch (err) {
      console.error("Error cambiando estado:", err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <Spacer y={6} />
          {/* Image and Basic Info Section */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 mb-8">
            <div className="flex justify-between items-center px-8 py-6">
              <h1 className="text-4xl font-bold">Detalle del Cultivo</h1>
              <div className="flex gap-3">
                <Button
                  color="warning"
                  variant="solid"
                  onPress={openEstado}
                  className="text-white font-semibold"
                >
                  Cambiar estado
                </Button>
                <Button
                  as={Link}
                  to={EDIT_PATH(cultivo.id)}
                  startContent={<Edit className="h-5 w-5" />}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  Editar
                </Button>
              </div>
            </div>
            <CardBody className="p-0">
              {cultivo.imagen ? (
                <img
                  src={cultivo.imagen}
                  alt={cultivo.nombre}
                  className="w-full h-80 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-t-lg flex items-center justify-center">
                  <Sprout className="h-32 w-32 text-emerald-600" />
                </div>
              )}
              <div className="p-8 bg-slate-50">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{cultivo.nombre}</h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{cultivo.descripcion || "Sin descripción disponible"}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
                    <Activity className="h-5 w-5 text-emerald-700" />
                    <span className="text-emerald-800 font-semibold">Estado: {cultivo.estado.toUpperCase()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md">
                    <CardBody className="text-center p-4">
                      <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-500 mb-1">Tipo de Cultivo</p>
                      <p className="text-lg font-bold text-gray-800">
                        {typeof cultivo.tipoCultivo === "string" ? cultivo.tipoCultivo : cultivo.tipoCultivo?.nombre || "N/A"}
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md">
                    <CardBody className="text-center p-4">
                      <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-500 mb-1">Lote y Sublote</p>
                      <p className="text-lg font-bold text-gray-800">{cultivo.lote?.nombre || 'N/A'} - {cultivo.sublote?.nombre || 'N/A'}</p>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-md">
                    <CardBody className="text-center p-4">
                      <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Inicio</p>
                      <p className="text-lg font-bold text-gray-800">{fmt(cultivo.fechaInicio)}</p>
                    </CardBody>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-md">
                    <CardBody className="text-center p-4">
                      <Sprout className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Siembra</p>
                      <p className="text-lg font-bold text-gray-800">{fmt(cultivo.fechaSiembra)}</p>
                    </CardBody>
                  </Card>
                  {cultivo.fechaFin && (
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 shadow-md">
                      <CardBody className="text-center p-4">
                        <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Fin</p>
                        <p className="text-lg font-bold text-gray-800">{fmt(cultivo.fechaFin)}</p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>


          {/* Financial Summary Section */}
          {(cultivo.costoTotal !== undefined || cultivo.ingresoTotal !== undefined) && (
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-7 w-7" />
                  <h3 className="text-2xl font-bold">Resumen Financiero</h3>
                </div>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {cultivo.costoTotal !== undefined && (
                    <Card className="bg-gradient-to-br from-red-100 to-red-200 border border-red-300 shadow-lg">
                      <CardBody className="text-center p-6">
                        <TrendingDown className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">Costo Total</p>
                        <p className="text-3xl font-bold text-red-800">
                          ${cultivo.costoTotal.toLocaleString("es-CO")}
                        </p>
                      </CardBody>
                    </Card>
                  )}
                  {cultivo.ingresoTotal !== undefined && (
                    <Card className="bg-gradient-to-br from-green-100 to-green-200 border border-green-300 shadow-lg">
                      <CardBody className="text-center p-6">
                        <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">Ingreso Total</p>
                        <p className="text-3xl font-bold text-green-800">
                          ${cultivo.ingresoTotal.toLocaleString("es-CO")}
                        </p>
                      </CardBody>
                    </Card>
                  )}
                  {cultivo.costoTotal !== undefined && cultivo.ingresoTotal !== undefined && (
                    <Card className={`bg-gradient-to-br ${cultivo.ingresoTotal - cultivo.costoTotal >= 0 ? 'from-green-100 to-green-200 border-green-300' : 'from-red-100 to-red-200 border-red-300'} border shadow-lg`}>
                      <CardBody className="text-center p-6">
                        {cultivo.ingresoTotal - cultivo.costoTotal >= 0 ? (
                          <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        ) : (
                          <TrendingDown className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        )}
                        <p className="text-lg font-medium text-gray-700 mb-2">Ganancia Neta</p>
                        <p className={`text-3xl font-bold ${cultivo.ingresoTotal - cultivo.costoTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                          ${(cultivo.ingresoTotal - cultivo.costoTotal).toLocaleString("es-CO")}
                        </p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={openEstadoModal} onOpenChange={setOpenEstadoModal}>
        <ModalContent>
          <ModalHeader>Cambiar estado del cultivo</ModalHeader>
          <ModalBody>
            <Select
              label="Nuevo estado"
              selectedKeys={new Set([nuevoEstado])}
              onSelectionChange={(keys) => {
                const k = (keys as Set<string>).values().next().value as EstadoCultivo;
                setNuevoEstado(k);
              }}
            >
              {["activo", "inactivo", "finalizado"].map((e) => (
                <SelectItem key={e}>{e}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Motivo del cambio"
              placeholder="Describe el motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpenEstadoModal(false)}>Cancelar</Button>
            <Button color="primary" onPress={submitCambioEstado} isLoading={updateMutation.isPending}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
