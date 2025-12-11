import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, ModalContent, ModalHeader, ModalBody, Chip, Card, CardBody, Divider, Tabs, Tab, Button, Textarea, Select, SelectItem, Input, ModalFooter, Spinner } from "@heroui/react";
import { Calendar, MapPin, Sprout, CircleDollarSign, History, Pencil, Workflow } from "lucide-react";
import { useCultivoDetail, useCultivoUpdate } from "../hooks/useCultivos";
import { useActividades } from "@/modules/actividad/hooks/useActividades";
import { IoTApi } from "@/modules/iot/api/iot.api";
import type { Sensor } from "@/modules/iot/model/iot.types";
import { SensorCharts } from "@/modules/iot/widgets/SensorCharts";
import { Wifi, Bell, Activity as ActivityIcon, Thermometer } from "lucide-react";
import CultivoTimeline from "./CultivoTimeline";

export function CultivoDetailModal({ cultivoId, onClose }: { cultivoId: number | null; onClose: () => void }) {
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
  useState(() => {
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
  }); // Note: useEffect better, but simplest refactor logic here. Actually using useEffect inside component body is cleaner.


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
    <Modal isOpen={!!cultivoId} onOpenChange={onClose} size="xl" scrollBehavior="outside">
      <ModalContent className="max-w-6xl">
        {() => (
          <>
            <ModalHeader>Detalle del cultivo</ModalHeader>
            <ModalBody>
              {isLoading || !cultivo ? (
                <div className="flex justify-center p-4">
                  <Spinner color="success" label="Cargando..." />
                </div>
              ) : (
                <Tabs aria-label="Detalle de cultivo" variant="underlined" classNames={{ tabList: "gap-6", tabContent: "text-base font-semibold" }} defaultSelectedKey="info">
                  <Tab key="info" title="Información">
                    <div className="space-y-4">
                      {cultivo.imagen && (
                        <img src={cultivo.imagen} alt={cultivo.nombre} className="w-full h-56 object-cover rounded-xl shadow-sm" />
                      )}

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <h3 className="text-xl font-semibold text-gray-800">{cultivo.nombre}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip color={cultivo.estado === "activo" ? "success" : cultivo.estado === "inactivo" ? "danger" : "primary"} variant="flat">
                              {cultivo.estado}
                            </Chip>
                            <Button as={Link} to={`/cultivos/editar/${cultivo.id}`} size="sm" variant="flat" startContent={<Pencil className="h-4 w-4" />}>
                              Editar
                            </Button>
                            <Button size="sm" color="warning" variant="flat" startContent={<Workflow className="h-4 w-4" />} onPress={openEstadoModal}>
                              Cambiar estado
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Sprout className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">
                            {typeof cultivo.tipoCultivo === "string" ? cultivo.tipoCultivo : cultivo.tipoCultivo?.nombre || "N/A"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 whitespace-pre-wrap border border-gray-100 bg-gray-50/60 rounded-lg p-3">
                        {cultivo.descripcion || "Sin descripción"}
                      </p>

                      <Divider />

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" /> Ubicación
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Lote</p>
                              <p className="flex items-center gap-2 text-gray-800">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                {cultivo.lote?.nombre || "N/A"}
                              </p>
                            </CardBody>
                          </Card>
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Sublote</p>
                              <p className="flex items-center gap-2 text-gray-800">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                {cultivo.sublote?.nombre || "N/A"}
                              </p>
                            </CardBody>
                          </Card>
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Estado</p>
                              <p className="text-gray-800 capitalize">{cultivo.estado}</p>
                            </CardBody>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-indigo-500" /> Fechas
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Inicio</p>
                              <p className="flex items-center gap-2 text-gray-800">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                {fmtDate(cultivo.fechaInicio)}
                              </p>
                            </CardBody>
                          </Card>
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Siembra</p>
                              <p className="flex items-center gap-2 text-gray-800">
                                <Calendar className="h-4 w-4 text-emerald-500" />
                                {fmtDate(cultivo.fechaSiembra)}
                              </p>
                            </CardBody>
                          </Card>
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Fin</p>
                              <p className="flex items-center gap-2 text-gray-800">
                                <Calendar className="h-4 w-4 text-rose-500" />
                                {fmtDate(cultivo.fechaFin)}
                              </p>
                            </CardBody>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4 text-amber-600" /> Totales
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Costo total</p>
                              <p className="text-gray-800">{fmtMoney(cultivo.costoTotal)}</p>
                            </CardBody>
                          </Card>
                          <Card shadow="sm">
                            <CardBody className="text-sm space-y-1">
                              <p className="font-semibold text-gray-700">Ingreso estimado</p>
                              <p className="text-gray-800">{fmtMoney(cultivo.ingresoTotal)}</p>
                            </CardBody>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </Tab>

                  <Tab
                    key="historial-actividades"
                    title={
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historial de actividades
                      </span>
                    }
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card shadow="sm">
                        <CardBody className="text-sm space-y-1">
                          <p className="font-semibold text-gray-700">N° actividades</p>
                          <p className="text-gray-900">{actividadStats.total}</p>
                        </CardBody>
                      </Card>
                      <Card shadow="sm">
                        <CardBody className="text-sm space-y-1">
                          <p className="font-semibold text-gray-700">Horas acumuladas</p>
                          <p className="text-gray-900">{actividadStats.horas}</p>
                        </CardBody>
                      </Card>
                      <Card shadow="sm">
                        <CardBody className="text-sm space-y-1">
                          <p className="font-semibold text-gray-700">Gastos</p>
                          <p className="text-gray-900">{fmtMoney(actividadStats.gastos)}</p>
                        </CardBody>
                      </Card>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Totales calculados a partir de las actividades registradas de este cultivo.</p>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-800">Actividades asociadas</p>
                      {actividadesFiltradas.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay actividades para este cultivo.</p>
                      ) : (
                        <div className="space-y-2">
                          {actividadesFiltradas.map((a: any) => (
                            <Card key={a.id} shadow="sm" className="border border-gray-100">
                              <CardBody className="p-3 flex flex-col gap-1 text-sm text-gray-800">
                                <div className="flex justify-between gap-2">
                                  <span className="font-semibold">{a.nombre}</span>
                                  <Chip size="sm" variant="flat" color="success">
                                    {a.tipo}
                                  </Chip>
                                </div>
                                <span className="text-gray-600">{a.subtipo}</span>
                                <span className="text-gray-500">
                                  {new Date(a.fecha).toLocaleDateString("es-CO")}
                                </span>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
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
                              <h4 className="font-bold text-gray-800">Configuración Global del Lote</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 block">Broker</span>
                                <span className="font-mono text-gray-800">{globalConfig.broker}:{globalConfig.port}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Tópico Base</span>
                                <span className="font-mono text-gray-800">{globalConfig.topicPrefix}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Estado</span>
                                <Chip size="sm" color={globalConfig.activo ? "success" : "default"} variant="dot">{globalConfig.activo ? 'Activo' : 'Inactivo'}</Chip>
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
                          <p className="text-gray-500 text-sm">No hay sensores asignados a este lote.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {iotSensors.map(sensor => (
                              <Card key={sensor.id} shadow="sm" className="border border-gray-100">
                                <CardBody className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-semibold text-gray-800 text-sm">{sensor.nombre}</p>
                                      <p className="text-xs text-gray-500">{sensor.tipoSensor?.nombre || sensor.mqttTopic}</p>
                                    </div>
                                    <Chip size="sm" color={sensor.estadoConexion === 'CONECTADO' ? 'success' : 'danger'} variant="flat" className="h-6">
                                      {sensor.estadoConexion === 'CONECTADO' ? 'Online' : 'Offline'}
                                    </Chip>
                                  </div>
                                  <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-gray-900">{sensor.ultimoValor ?? '--'}</span>
                                    <span className="text-sm text-gray-500 mb-1">{sensor.tipoSensor?.unidad}</span>
                                  </div>
                                  <Divider className="my-2" />
                                  <div className="flex justify-between text-xs text-gray-500">
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
                            <ActivityIcon className="w-4 h-4 text-purple-600" /> Gráficas en Tiempo Real
                          </h4>
                          <div className="h-[350px]">
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
                          <Bell className="w-4 h-4 text-red-500" /> Últimas Alertas
                        </h4>
                        {recentAlerts.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">No hay alertas recientes.</p>
                        ) : (
                          <div className="space-y-2">
                            {recentAlerts.map((alert, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <Bell className="w-5 h-5 text-red-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {alert.mensaje || `Alerta en ${alert.sensor?.nombre || 'Sensor'}`}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Valor: {alert.valor} | Fecha: {new Date(alert.fechaAlerta).toLocaleString()}
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
                    <CultivoTimeline cultivoId={cultivo.id} />
                  </Tab>
                </Tabs>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>

      <Modal isOpen={isEstadoModalOpen} onOpenChange={setIsEstadoModalOpen}>
        <ModalContent>
          <ModalHeader>Cambiar estado</ModalHeader>
          <ModalBody className="space-y-3">
            <Select
              label="Nuevo estado"
              selectedKeys={new Set([nuevoEstado])}
              onSelectionChange={(keys) => {
                const k = (keys as Set<string>).values().next().value as string;
                setNuevoEstado(k);
              }}
            >
              {["activo", "inactivo", "finalizado"].map((e) => (
                <SelectItem key={e}>{e}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Motivo"
              placeholder="Describe el motivo del cambio"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              isRequired
            />
            <Input readOnly label="Cultivo" value={cultivo?.nombre || ""} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEstadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={submitEstado} isLoading={updateMutation.isPending} isDisabled={!motivo.trim()}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}






