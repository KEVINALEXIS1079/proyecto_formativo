import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  Image,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Camera,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Package,
  Wrench,
  User,
  Crown,
  Pencil,
  Leaf,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";

interface VerActividadModalProps {
  isOpen: boolean;
  onClose: () => void;
  actividad: any;
}

export default function VerActividadModal({
  isOpen,
  onClose,
  actividad,
}: VerActividadModalProps) {
  if (!actividad) return null;

  // Calculate totals
  const responsablesCount = actividad.responsables?.length || 0;
  const totalLaborCost = actividad.costoManoObra || 0;
  const totalInputsCost =
    actividad.insumosUso?.reduce(
      (sum: number, i: any) => sum + i.costoTotal,
      0
    ) || 0;
  const totalServicesCost =
    actividad.servicios?.reduce((sum: number, s: any) => sum + s.costo, 0) || 0;
  const grandTotal = totalLaborCost + totalInputsCost + totalServicesCost;

  const activityHours = actividad.horasActividad || 0;
  const activityPricePerHour = actividad.precioHoraActividad || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-2 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {actividad.nombre}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Chip size="sm" color="success" variant="flat">
                      {actividad.tipo}
                    </Chip>
                    <Chip size="sm" color="primary" variant="flat">
                      {actividad.subtipo}
                    </Chip>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(actividad.fecha).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Costo Total
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(grandTotal)}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="py-4">
              <div className="p-3 mb-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                Modificar una actividad es delicado: valida responsablemente los cambios de lote/sublote, fechas, descripción y evidencias.
              </div>

              <Tabs
                aria-label="Detalles de la actividad"
                color="success"
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full bg-green-600",
                  tab: "max-w-fit px-4 h-12",
                }}
              >
                {/* GENERAL TAB */}
                <Tab key="general" title="Información General">
                  <div className="space-y-6 py-4">
                    {/* Location Information */}
                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          Ubicación
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InfoCard
                            label="Lote"
                            value={actividad.lote?.nombre}
                            icon={<MapPin className="w-4 h-4" />}
                          />
                          <InfoCard
                            label="Sublote"
                            value={actividad.subLote?.nombre || "N/A"}
                            icon={<MapPin className="w-4 h-4" />}
                          />
                          <InfoCard
                            label="Cultivo"
                            value={actividad.cultivo?.nombre || "N/A"}
                            icon={<Package className="w-4 h-4" />}
                          />
                        </div>
                      </CardBody>
                    </Card>

                    {/* Activity Details */}
                    {actividad.subtipo === "COSECHA" && (
                      <Card shadow="sm" className="border border-orange-200 bg-orange-50 mb-4">
                        <CardBody className="p-4">
                          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                            <Leaf className="w-5 h-5" />
                            Datos de Cosecha
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard
                              label="Plantas Cosechadas"
                              value={actividad.cantidadPlantas ? `${actividad.cantidadPlantas} plantas` : "N/A"}
                              icon={<Sprout className="w-4 h-4 text-orange-700" />}
                            />
                            <InfoCard
                              label="Cantidad Recolectada"
                              value={actividad.kgRecolectados ? `${actividad.kgRecolectados} Kg` : "N/A"}
                              icon={<Package className="w-4 h-4 text-orange-700" />}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    )}

                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Detalles de la Actividad
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoCard
                            label="Duración"
                            value={`${activityHours} horas`}
                            icon={<Clock className="w-4 h-4" />}
                          />
                          <InfoCard
                            label="Precio por Hora"
                            value={new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(activityPricePerHour)}
                            icon={<DollarSign className="w-4 h-4" />}
                          />
                        </div>
                        {actividad.descripcion && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                              Descripción
                            </p>
                            <p className="text-gray-700">
                              {actividad.descripcion}
                            </p>
                          </div>
                        )}
                      </CardBody>
                    </Card>

                    {/* Participants */}
                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            Participantes
                          </h3>
                          <Chip size="sm" color="secondary" variant="flat">
                            {responsablesCount} responsables
                          </Chip>
                        </div>

                        <div className="space-y-2">
                          {/* Creator */}
                          <Card className="bg-amber-50 border border-amber-200">
                            <CardBody className="p-3 flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-amber-600" />
                                <div>
                                  <p className="text-xs text-amber-700 font-semibold uppercase mb-1">
                                    Creador de la actividad
                                  </p>
                                  <p className="font-semibold text-gray-800">
                                    Nombre: {actividad.creadoPorUsuario?.nombre}{" "}
                                    {actividad.creadoPorUsuario?.apellido}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Identificación:{" "}
                                    {actividad.creadoPorUsuario
                                      ?.identificacion ||
                                      actividad.creadoPorUsuarioId}
                                  </p>
                                </div>
                              </div>
                              <Chip size="sm" color="warning" variant="flat">
                                Sin costo MO
                              </Chip>
                            </CardBody>
                          </Card>

                          {/* Responsible Workers */}
                          {actividad.responsables?.map((resp: any) => (
                            <Card
                              key={resp.id}
                              className="border border-green-100 hover:border-green-300 transition-colors"
                            >
                              <CardBody className="p-3 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <User className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      Nombre: {resp.usuario?.nombre}{" "}
                                      {resp.usuario?.apellido}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Identificación:{" "}
                                      {resp.usuario?.identificacion}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {resp.horas} hrs × $
                                      {resp.precioHora.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Costo</p>
                                  <p className="font-semibold text-green-700">
                                    {new Intl.NumberFormat("es-CO", {
                                      style: "currency",
                                      currency: "COP",
                                      maximumFractionDigits: 0,
                                    }).format(resp.costo)}
                                  </p>
                                </div>
                              </CardBody>
                            </Card>
                          ))}

                          {responsablesCount === 0 && (
                            <p className="text-gray-400 italic text-sm text-center py-4">
                              No hay responsables asignados
                            </p>
                          )}
                        </div>

                        <Divider className="my-4" />

                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-semibold text-gray-800">
                            Total Mano de Obra
                          </span>
                          <span className="text-xl font-bold text-green-700">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(totalLaborCost)}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </Tab>

                {/* RESOURCES TAB */}
                <Tab key="recursos" title="Recursos">
                  <div className="space-y-6 py-4">
                    {/* Inputs */}
                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-orange-600" />
                          Insumos Utilizados
                        </h3>

                        {actividad.insumosUso &&
                          actividad.insumosUso.length > 0 ? (
                          <>
                            <div className="space-y-2">
                              {actividad.insumosUso.map((insumo: any) => (
                                <Card
                                  key={insumo.id}
                                  className="border border-orange-100"
                                >
                                  <CardBody className="p-3 flex flex-row items-center justify-between">
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {insumo.insumo?.nombre || "Insumo"}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Cantidad: {insumo.cantidadUso}{" "}
                                        {insumo.insumo?.unidadUso || "unid"} × $
                                        {insumo.costoUnitarioUso.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        Costo
                                      </p>
                                      <p className="font-semibold text-orange-700">
                                        {new Intl.NumberFormat("es-CO", {
                                          style: "currency",
                                          currency: "COP",
                                          maximumFractionDigits: 0,
                                        }).format(insumo.costoTotal)}
                                      </p>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>

                            <Divider className="my-4" />

                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                              <span className="font-semibold text-gray-800">
                                Total Insumos
                              </span>
                              <span className="text-xl font-bold text-orange-700">
                                {new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0,
                                }).format(totalInputsCost)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-400 italic text-sm text-center py-4">
                            No se utilizaron insumos en esta actividad
                          </p>
                        )}
                      </CardBody>
                    </Card>

                    {/* Services */}
                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-blue-600" />
                          Servicios y Maquinaria
                        </h3>

                        {actividad.servicios &&
                          actividad.servicios.length > 0 ? (
                          <>
                            <div className="space-y-2">
                              {actividad.servicios.map((servicio: any) => (
                                <Card
                                  key={servicio.id}
                                  className="border border-blue-100"
                                >
                                  <CardBody className="p-3 flex flex-row items-center justify-between">
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {servicio.nombreServicio}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {servicio.horas} hrs × $
                                        {servicio.precioHora.toLocaleString()}
                                        /hr
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        Costo
                                      </p>
                                      <p className="font-semibold text-blue-700">
                                        {new Intl.NumberFormat("es-CO", {
                                          style: "currency",
                                          currency: "COP",
                                          maximumFractionDigits: 0,
                                        }).format(servicio.costo)}
                                      </p>
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>

                            <Divider className="my-4" />

                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="font-semibold text-gray-800">
                                Total Servicios
                              </span>
                              <span className="text-xl font-bold text-blue-700">
                                {new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0,
                                }).format(totalServicesCost)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-400 italic text-sm text-center py-4">
                            No se utilizaron servicios en esta actividad
                          </p>
                        )}
                      </CardBody>
                    </Card>

                    {/* Tools and Machinery */}
                    <Card shadow="sm" className="border border-gray-200">
                      <CardBody className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-purple-600" />
                          Herramientas y Maquinaria
                        </h3>

                        {actividad.usosHerramientas &&
                          actividad.usosHerramientas.length > 0 ? (
                          <div className="space-y-2">
                            {actividad.usosHerramientas.map((uso: any) => (
                              <Card
                                key={uso.id}
                                className="border border-purple-100"
                              >
                                <CardBody className="p-3 flex flex-row items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {uso.insumo?.nombre || "Herramienta"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {uso.horasUsadas} hrs de uso
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Depreciación
                                    </p>
                                    <p className="font-semibold text-purple-700">
                                      {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        maximumFractionDigits: 0,
                                      }).format(uso.depreciacionGenerada)}
                                    </p>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic text-sm text-center py-4">
                            No se utilizaron herramientas en esta actividad
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                </Tab>

                {/* EVIDENCE TAB - Read Only */}
                <Tab key="evidencias" title="Evidencias">
                  <div className="space-y-6 py-4">
                    {actividad.evidencias && actividad.evidencias.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-green-600" />
                          Evidencias Registradas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {actividad.evidencias.map((ev: any) => (
                            <Card
                              key={ev.id}
                              className="border border-gray-200"
                            >
                              <CardBody className="p-3">
                                {ev.imagenes && ev.imagenes.length > 0 && (
                                  <Image
                                    src={`http://localhost:4000${ev.imagenes[0]}`}
                                    alt="Evidencia"
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                  />
                                )}
                                <p className="text-sm text-gray-700 mb-2">
                                  {ev.descripcion}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(ev.createdAt).toLocaleDateString(
                                    "es-CO"
                                  )}
                                </p>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-8">
                        No hay evidencias registradas para esta actividad
                      </p>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter className="border-t border-gray-200">
              <Button
                as={Link}
                to={`/actividades/${actividad.id}/editar`}
                color="warning"
                variant="flat"
                startContent={<Pencil className="w-4 h-4" />}
              >
                Editar actividad
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        <p className="text-xs text-gray-600 uppercase font-semibold">{label}</p>
      </div>
      <p className="text-gray-900 font-medium">{value || "N/A"}</p>
    </div>
  );
}
