import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image,
    Chip,
    Tabs,
    Tab,
    Card,
    CardBody,
    Divider,
    Progress,
} from "@heroui/react";
import {
    Package,
    DollarSign,
    Clock,
    MapPin,
    TrendingDown,
    Wrench,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";

interface ViewActivoFijoModalProps {
    isOpen: boolean;
    onClose: () => void;
    activo: any | null;
}

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

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



export const ViewActivoFijoModal: React.FC<ViewActivoFijoModalProps> = ({
    isOpen,
    onClose,
    activo,
}) => {


    if (!activo) return null;

    const valorLibros = Math.max(0, (activo.costoAdquisicion || 0) - (activo.depreciacionAcumulada || 0));
    const porcentajeUso = activo.vidaUtilHoras > 0 ? ((activo.horasUsadas || 0) / activo.vidaUtilHoras) * 100 : 0;
    const porcentajeDepreciacion = activo.costoAdquisicion > 0 ? ((activo.depreciacionAcumulada || 0) / activo.costoAdquisicion) * 100 : 0;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'DISPONIBLE': return 'success';
            case 'EN_USO': return 'primary';
            case 'MANTENIMIENTO': return 'warning';
            case 'DADO_DE_BAJA': return 'danger';
            case 'RESERVADO': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-2 pb-2 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {activo.nombre}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Chip size="sm" color={getEstadoColor(activo.estado)} variant="flat">
                                                {activo.estado || 'DISPONIBLE'}
                                            </Chip>
                                            <Chip size="sm" color="secondary" variant="flat">
                                                {activo.categoria?.nombre || 'Sin categoría'}
                                            </Chip>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                ID: {activo.id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            Valor en Libros
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(valorLibros)}
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>

                            <ModalBody className="py-4">
                                <Tabs
                                    aria-label="Detalles del activo fijo"
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
                                            {/* Image and Basic Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Image */}
                                                <div className="flex justify-center items-start">
                                                    {activo.fotoUrl ? (
                                                        <Image
                                                            src={
                                                                /^(data:|blob:|https?:\/\/)/i.test(activo.fotoUrl)
                                                                    ? activo.fotoUrl
                                                                    : `${FILES_BASE.replace(/\/+$/, "")}/${activo.fotoUrl.replace(/^\/+/, "")}`
                                                            }
                                                            alt={activo.nombre}
                                                            width={300}
                                                            height={300}
                                                            className="object-cover rounded-lg shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                                            <Package className="w-16 h-16" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Basic Details */}
                                                <div>
                                                    <Card shadow="sm" className="border border-gray-200">
                                                        <CardBody className="p-4">
                                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                                <Wrench className="w-5 h-5 text-blue-600" />
                                                                Detalles del Activo
                                                            </h3>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Nombre</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{activo.nombre}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Categoría</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{activo.categoria?.nombre || "N/A"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Almacén</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{activo.almacen?.nombre || "N/A"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Proveedor</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{activo.proveedor?.nombre || "N/A"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2">
                                                                    <span className="text-sm text-gray-600">Estado</span>
                                                                    <Chip size="sm" variant="flat" color={getEstadoColor(activo.estado)}>
                                                                        {activo.estado || 'DISPONIBLE'}
                                                                    </Chip>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {activo.descripcion && (
                                                <Card shadow="sm" className="border border-gray-200">
                                                    <CardBody className="p-4">
                                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                                                        <p className="text-gray-600 text-sm">{activo.descripcion}</p>
                                                    </CardBody>
                                                </Card>
                                            )}

                                            {/* Location */}
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-green-600" />
                                                        Ubicación
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InfoCard
                                                            label="Almacén"
                                                            value={activo.almacen?.nombre}
                                                            icon={<MapPin className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Ubicación"
                                                            value={activo.almacen?.descripcion || activo.almacen?.nombre || "N/A"}
                                                            icon={<MapPin className="w-4 h-4" />}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </Tab>

                                    {/* FINANCIAL TAB */}
                                    <Tab key="financiero" title="Información Financiera">
                                        <div className="space-y-6 py-4">
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <DollarSign className="w-5 h-5 text-green-600" />
                                                        Valores Financieros
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InfoCard
                                                            label="Costo de Adquisición"
                                                            value={formatCurrency(activo.costoAdquisicion)}
                                                            icon={<DollarSign className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Valor Residual"
                                                            value={formatCurrency(activo.valorResidual)}
                                                            icon={<DollarSign className="w-4 h-4" />}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            <Card shadow="sm" className="border border-orange-200 bg-orange-50">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                                        <TrendingDown className="w-5 h-5 text-orange-700" />
                                                        Depreciación
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-orange-800 font-medium">Depreciación Acumulada</span>
                                                            <span className="text-lg font-bold text-orange-900">{formatCurrency(activo.depreciacionAcumulada || 0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-xs text-orange-700 mb-1">
                                                                <span>Progreso de Depreciación</span>
                                                                <span>{porcentajeDepreciacion.toFixed(1)}%</span>
                                                            </div>
                                                            <Progress
                                                                value={porcentajeDepreciacion}
                                                                color="warning"
                                                                className="max-w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            <Divider className="my-4" />

                                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                                <span className="font-semibold text-gray-800 text-lg">Valor en Libros Actual</span>
                                                <span className="text-2xl font-bold text-green-700">{formatCurrency(valorLibros)}</span>
                                            </div>
                                        </div>
                                    </Tab>

                                    {/* USAGE TAB */}
                                    <Tab key="uso" title="Vida Útil y Uso">
                                        <div className="space-y-6 py-4">
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-purple-600" />
                                                        Información de Uso
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InfoCard
                                                            label="Vida Útil Total"
                                                            value={`${activo.vidaUtilHoras || 0} horas`}
                                                            icon={<Clock className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Horas Usadas"
                                                            value={`${activo.horasUsadas || 0} horas`}
                                                            icon={<Clock className="w-4 h-4" />}
                                                        />
                                                    </div>

                                                    <div className="mt-6">
                                                        <div className="flex justify-between text-sm text-gray-700 mb-2">
                                                            <span className="font-medium">Progreso de Uso</span>
                                                            <span className="font-semibold">{porcentajeUso.toFixed(1)}%</span>
                                                        </div>
                                                        <Progress
                                                            value={porcentajeUso}
                                                            color={porcentajeUso > 80 ? "danger" : porcentajeUso > 50 ? "warning" : "success"}
                                                            className="max-w-full"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Horas restantes: {Math.max(0, (activo.vidaUtilHoras || 0) - (activo.horasUsadas || 0))} horas
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            {activo.fechaUltimoMantenimiento && (
                                                <Card shadow="sm" className="border border-blue-200 bg-blue-50">
                                                    <CardBody className="p-4">
                                                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Último Mantenimiento</h3>
                                                        <p className="text-blue-800">
                                                            {new Date(activo.fechaUltimoMantenimiento).toLocaleDateString('es-CO', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </ModalBody>

                            <ModalFooter className="border-t border-gray-200">

                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>


        </>
    );
};
