import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, ModalContent, ModalHeader, ModalBody, Chip, Card, CardBody, Divider, Tabs, Tab, Button, Textarea, Select, SelectItem, Input, ModalFooter, Spinner } from "@heroui/react";
import { Calendar, MapPin, Sprout, CircleDollarSign, History, Pencil, Workflow, Wifi, Bell, Activity as ActivityIcon, Thermometer } from "lucide-react";
import { useCultivoDetail, useCultivoUpdate } from "../hooks/useCultivos";
import { useActividades } from "@/modules/actividad/hooks/useActividades";
import { IoTApi } from "@/modules/iot/api/iot.api";
import type { Sensor } from "@/modules/iot/model/iot.types";
import { SensorCharts } from "@/modules/iot/widgets/SensorCharts";
import CultivoTimeline from "./CultivoTimeline";

interface CultivoDetailModalProps {
  cultivoId: number | null;
  onClose: () => void;
  onEdit?: (cultivo: any) => void;
}

export function CultivoDetailModal({ cultivoId, onClose, onEdit }: CultivoDetailModalProps) {
  const { data: cultivo, isLoading } = useCultivoDetail(cultivoId || 0);
  const updateMutation = useCultivoUpdate();
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>("activo");
  const [motivo, setMotivo] = useState("");
  const { data: actividades = [] } = useActividades(cultivoId ? { cultivoId } : undefined, { enabled: !!cultivoId });

  // Estado para IoT
  const [iotSensors, setIotSensors] = useState<Sensor[]>([]);
  const [globalConfig, setGlobalConfig] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loadingIoT, setLoadingIoT] = useState(false);

  // Cargar datos IoT cuando abre el modal
  useEffect(() => {
    if (cultivo?.lote?.id) {
      setLoadingIoT(true);
      Promise.all([
        IoTApi.getSensors({ loteId: cultivo.lote.id }),
        IoTApi.getGlobalConfigs(),
        IoTApi.getAlerts({ loteId: cultivo.lote.id })
      ]).then(([sensors, configs, alerts]) => {
        setIotSensors(sensors);
        const config = configs.find(c => c.loteId === cultivo.lote?.id);
        setGlobalConfig(config);
        setRecentAlerts(alerts ? alerts.slice(0, 3) : []);
      }).finally(() => setLoadingIoT(false));
    }
  }, [cultivo]);


  const fmtDate = (date?: string) => (date ? new Date(date).toLocaleDateString("es-CO") : "N/A");
  const fmtMoney = (value?: number) =>
    value || value === 0 ? value.toLocaleString("es-CO", { style: "currency", currency: "COP" }) : "N/A";

  const actividadesFiltradas = (actividades || []).filter((a: any) => {
    const idActividadCultivo =
      a.cultivoId ??
      a.cultivo?.id ??
      a.cultivo_id ??
      a.cultivo?.id_cultivo_pk ??
      a.cultivo?.id_cultivo;
    return Number(idActividadCultivo) === Number(cultivoId);
  });

  const actividadStats = (() => {
    const total = actividadesFiltradas.length;
    const horas = actividadesFiltradas.reduce((acc, a: any) => acc + (Number(a.horasActividad) || 0), 0);
    const gastos = actividadesFiltradas.reduce((acc, a: any) => {
      const manoObra = Number(a.costoManoObra) || 0;
      const insumos = Array.isArray(a.insumosUso) ? a.insumosUso.reduce((s: number, i: any) => s + (Number(i.costoTotal) || 0), 0) : 0;
      const servicios = Array.isArray(a.servicios) ? a.servicios.reduce((s: number, sv: any) => s + (Number(sv.costo) || 0), 0) : 0;
      const otros = Number(a.costoTotal) || 0;
      return acc + manoObra + insumos + servicios + otros;
    }, 0);
    return { total, horas, gastos };
  })();

  const openEstadoModal = () => {
    if (!cultivo) return;
    setNuevoEstado(cultivo.estado || "activo");
    setMotivo("");
    setIsEstadoModalOpen(true);
  };

  const submitEstado = async () => {
    if (!cultivo) return;
    if (!motivo.trim()) return;
    try {
      await updateMutation.mutateAsync({ id: cultivo.id, dto: { estado: nuevoEstado as any, motivo } });
      setIsEstadoModalOpen(false);
    } catch (err) {
      console.error("Error actualizando estado", err);
    }
  };

  return (
    <Modal isOpen={!!cultivoId} onOpenChange={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Detalle del cultivo</ModalHeader>
            <ModalBody>
              {isLoading || !cultivo ? (
                <div className="flex justify-center p-8">
                  <Spinner color="success" label="Cargando detalles..." />
                </div>
              ) : (
                <Tabs
                  aria-label="Detalle de cultivo"
                  variant="underlined"
                  classNames={{
                    tabList: "gap-6",
                    tabContent: "text-base font-semibold group-data-[selected=true]:text-success"
                  }}
                  defaultSelectedKey="info"
                >
                  <Tab key="info" title="Información General">
                    <div className="space-y-6">
                      {/* Cabecera con Imagen y Acciones */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {cultivo.imagen && (
                          <img
                            src={cultivo.imagen}
                            alt={cultivo.nombre}
                            className="w-full md:w-1/3 h-56 object-cover rounded-xl shadow-sm bg-gray-100"
                          />
                        )}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Nombre del Cultivo</p>
                              <h3 className="text-2xl font-bold text-gray-900">{cultivo.nombre}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Chip
                                color={cultivo.estado === "activo" ? "success" : cultivo.estado === "inactivo" ? "danger" : "primary"}
                                variant="flat"
                                size="lg"
                              >
                                {cultivo.estado?.toUpperCase()}
                              </Chip>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {onEdit ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                className="text-black font-medium"
                                startContent={<Pencil className="h-4 w-4" />}
                                onPress={() => onEdit(cultivo)}
                              >
                                Editar Información
                              </Button>
                            ) : (
                              <Button
                                as={Link}
                                to={`/cultivos/editar/${cultivo.id}`}
                                size="sm"
                                variant="flat"
                                startContent={<Pencil className="h-4 w-4" />}
                              >
                                Editar (Link)
                              </Button>
                            )}
                            <Button
                              size="sm"
                              color="warning"
                              variant="flat"
                              startContent={<Workflow className="h-4 w-4" />}
                              onPress={openEstadoModal}
                            >
                              Cambiar Estado
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit">
                            <Sprout className="h-5 w-5 text-green-600" />
                            <span className="font-semibold">
                              Tipo: {typeof cultivo.tipoCultivo === "string" ? cultivo.tipoCultivo : cultivo.tipoCultivo?.nombre || "N/A"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 whitespace-pre-wrap border border-gray-100 bg-white p-3 rounded-lg shadow-sm">
                            {cultivo.descripcion || "Sin descripción disponible."}
                          </p>
                        </div>
                      </div>

                      <Divider className="my-2" />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Ubicación */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-600" /> Ubicación
                          </h4>
                          <Card shadow="sm" className="border border-gray-100">
                            <CardBody className="gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Lote</p>
                                <p className="font-semibold text-gray-900">{cultivo.lote?.nombre || "N/A"}</p>
                              </div>
                              <Divider className="my-1" />
                              <div>
                                <p className="text-xs text-gray-500">Sublote</p>
                                <p className="font-semibold text-gray-900">{cultivo.sublote?.nombre || "N/A"}</p>
                              </div>
                            </CardBody>
                          </Card>
                        </div>

                        {/* Fechas */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" /> Cronograma
                          </h4>
                          <Card shadow="sm" className="border border-gray-100">
                            <CardBody className="gap-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500">Inicio</p>
                                  <p className="font-medium text-indigo-600">{fmtDate(cultivo.fechaInicio)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Siembra</p>
                                  <p className="font-medium text-emerald-600">{fmtDate(cultivo.fechaSiembra)}</p>
                                </div>
                                <div className="col-span-2 mt-1">
                                  <p className="text-xs text-gray-500">Finalización Estimada</p>
                                  <p className="font-medium text-rose-600">{fmtDate(cultivo.fechaFin)}</p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </div>

                        {/* Financiero */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-amber-600" /> Balance Financiero
                          </h4>
                          <Card shadow="sm" className="bg-amber-50/50 border border-amber-100">
                            <CardBody className="gap-2">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700">Costo Total</p>
                                <p className="text-lg font-bold text-gray-900">{fmtMoney(cultivo.costoTotal)}</p>
                              </div>
                              <Divider className="my-1 bg-amber-200/50" />
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700">Ingreso Est.</p>
                                <p className="text-lg font-bold text-green-700">{fmtMoney(cultivo.ingresoTotal)}</p>
                              </div>
                            </CardBody>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </Tab>

                  <Tab
                    key="historial-actividades"
                    title={
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        <span>Historial Actividades</span>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card shadow="sm" className="border-l-4 border-l-blue-500">
                          <CardBody>
                            <p className="text-sm text-gray-500 font-medium">Total Actividades</p>
                            <p className="text-3xl font-bold text-gray-900">{actividadStats.total}</p>
                          </CardBody>
                        </Card>
                        <Card shadow="sm" className="border-l-4 border-l-purple-500">
                          <CardBody>
                            <p className="text-sm text-gray-500 font-medium">Horas Invertidas</p>
                            <p className="text-3xl font-bold text-gray-900">{actividadStats.horas} h</p>
                          </CardBody>
                        </Card>
                        <Card shadow="sm" className="border-l-4 border-l-amber-500">
                          <CardBody>
                            <p className="text-sm text-gray-500 font-medium">Gastos Registrados</p>
                            <p className="text-3xl font-bold text-gray-900">{fmtMoney(actividadStats.gastos)}</p>
                          </CardBody>
                        </Card>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-800">Línea de tiempo de actividades</h4>
                        {actividadesFiltradas.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No hay actividades registradas para este cultivo aún.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {actividadesFiltradas.map((a: any) => (
                              <Card key={a.id} shadow="sm" className="border border-gray-100 hover:border-gray-300 transition-colors">
                                <CardBody className="p-4">
                                  <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-semibold text-gray-900 line-clamp-1">{a.nombre}</h5>
                                    <span className="text-xs text-gray-500 shrink-0">{new Date(a.fecha).toLocaleDateString("es-CO")}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    <Chip size="sm" variant="flat" color="success" className="h-6 text-xs">{a.tipo}</Chip>
                                    <Chip size="sm" variant="flat" className="h-6 text-xs bg-gray-100 text-gray-600">{a.subtipo}</Chip>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{a.descripcion || "Sin detalles"}</p>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Tab>

                  <Tab
                    key="iot-monitor"
                    title={
                      <div className="flex items-center gap-2">
                        <ActivityIcon className="h-4 w-4" />
                        <span>Monitor IoT</span>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      {/* Global Config Summary */}
                      {globalConfig && (
                        <Card shadow="sm" className="bg-slate-50 border border-slate-200">
                          <CardBody>
                            <div className="flex items-center gap-3 mb-2">
                              <Wifi className="w-5 h-5 text-blue-600" />
                              <h4 className="font-bold text-gray-800">Conectividad Lote</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 block">Broker MQTT</span>
                                <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200">{globalConfig.broker}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Tópico Base</span>
                                <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200">{globalConfig.topicPrefix}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Estado:</span>
                                <Chip size="sm" color={globalConfig.activo ? "success" : "default"} variant="dot">{globalConfig.activo ? 'En línea' : 'Desconectado'}</Chip>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      )}

                      {/* Sensors List & Thresholds */}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-emerald-600" /> Sensores Activos ({iotSensors.length})
                        </h4>
                        {iotSensors.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No hay sensores asignados a este lote/sublote.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {iotSensors.map(sensor => (
                              <Card key={sensor.id} shadow="sm" className="border border-gray-100 hover:shadow-md transition-shadow">
                                <CardBody className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <p className="font-semibold text-gray-900">{sensor.nombre}</p>
                                      <p className="text-xs text-gray-500 font-mono">{sensor.mqttTopic?.split('/').pop() || sensor.tipoSensor?.nombre}</p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${sensor.estadoConexion === 'CONECTADO' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} title={sensor.estadoConexion} />
                                  </div>
                                  <div className="text-center py-2 bg-gray-50 rounded-lg mb-3">
                                    <span className="text-3xl font-bold text-gray-800">{sensor.ultimoValor ?? '--'}</span>
                                    <span className="text-sm text-gray-500 ml-1">{sensor.tipoSensor?.unidad}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                                    <span>Min: {sensor.umbralMin ?? '-'}</span>
                                    <span>Max: {sensor.umbralMax ?? '-'}</span>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Charts */}
                      {iotSensors.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-purple-600" /> Análisis en Tiempo Real
                          </h4>
                          <div className="h-[400px] bg-white rounded-xl border border-gray-200 p-2">
                            <SensorCharts
                              sensors={iotSensors}
                              layout="carousel"
                              isLive={true}
                              timeSeriesData={[]}
                              sensorSummaryData={[]}
                              loading={loadingIoT}
                            />
                          </div>
                        </div>
                      )}

                      {/* Recent Alerts */}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-red-500" /> Alertas Recientes
                        </h4>
                        {recentAlerts.length === 0 ? (
                          <p className="text-gray-500 text-sm italic pl-6">No hay alertas críticas recientes.</p>
                        ) : (
                          <div className="space-y-2">
                            {recentAlerts.map((alert, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <Bell className="w-5 h-5 text-red-500 shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {alert.mensaje || `Alerta en ${alert.sensor?.nombre || 'Sensor'}`}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Valor: {alert.valor} | {new Date(alert.fechaAlerta).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    key="timeline"
                    title={
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4" />
                        <span>Línea de Tiempo</span>
                      </div>
                    }
                  >
                    <div className="py-4">
                      <CultivoTimeline cultivoId={cultivo.id} />
                    </div>
                  </Tab>
                </Tabs>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} variant="light">
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>

      <Modal isOpen={isEstadoModalOpen} onOpenChange={setIsEstadoModalOpen}>
        <ModalContent>
          <ModalHeader>Cambiar estado del cultivo</ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm text-gray-500">Selecciona el nuevo estado y proporciona una razón para el cambio. Esta acción quedará registrada en el historial.</p>
            <Select
              label="Nuevo estado"
              selectedKeys={new Set([nuevoEstado])}
              onSelectionChange={(keys) => {
                const k = (keys as Set<string>).values().next().value as string;
                setNuevoEstado(k);
              }}
              variant="bordered"
            >
              {["activo", "inactivo", "finalizado"].map((e) => (
                <SelectItem key={e} textValue={e.toUpperCase()}>{e.toUpperCase()}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Motivo del cambio"
              placeholder="Describe por qué estás cambiando el estado..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              isRequired
              variant="bordered"
            />
            <Input readOnly label="Cultivo seleccionado" value={cultivo?.nombre || ""} variant="flat" />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEstadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={submitEstado} isLoading={updateMutation.isPending} isDisabled={!motivo.trim()}>
              Guardar Cambio
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}






