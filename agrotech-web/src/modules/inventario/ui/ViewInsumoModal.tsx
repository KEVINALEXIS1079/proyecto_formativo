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
    Progress,
} from "@heroui/react";
import {
    Package,
    DollarSign,
    TrendingUp,
    MapPin,
    Layers,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";

interface ViewInsumoModalProps {
    isOpen: boolean;
    onClose: () => void;
    insumo: any | null;
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



export const ViewInsumoModal: React.FC<ViewInsumoModalProps> = ({
    isOpen,
    onClose,
    insumo,
}) => {


    if (!insumo) return null;

    const stockPercentage = insumo.stockPresentaciones > 0 ? 100 : 0;
    const getStockColor = () => {
        if (insumo.stockPresentaciones === 0) return 'danger';
        if (insumo.stockPresentaciones < 10) return 'warning';
        return 'success';
    };

    const getStockStatus = () => {
        if (insumo.stockPresentaciones === 0) return 'Sin Stock';
        if (insumo.stockPresentaciones < 10) return 'Stock Bajo';
        return 'Stock Disponible';
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
                                            {insumo.nombre}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Chip size="sm" color={getStockColor()} variant="flat">
                                                {getStockStatus()}
                                            </Chip>
                                            <Chip size="sm" color="secondary" variant="flat">
                                                {insumo.categoria?.nombre || 'Sin categoría'}
                                            </Chip>
                                            <Chip size="sm" color="primary" variant="flat">
                                                {insumo.tipoMateria === 'solido' ? 'Sólido' : 'Líquido'}
                                            </Chip>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                ID: {insumo.id}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">
                                            Valor Total
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(insumo.precioTotal || 0)}
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>

                            <ModalBody className="py-4">
                                <Tabs
                                    aria-label="Detalles del insumo"
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
                                                    {insumo.imagenUrl ? (
                                                        <Image
                                                            src={
                                                                /^(data:|blob:|https?:\/\/)/i.test(insumo.imagenUrl)
                                                                    ? insumo.imagenUrl
                                                                    : `${FILES_BASE.replace(/\/+$/, "")}/${insumo.imagenUrl.replace(/^\/+/, "")}`
                                                            }
                                                            alt={insumo.nombre}
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
                                                                <Package className="w-5 h-5 text-blue-600" />
                                                                Detalles del Insumo
                                                            </h3>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Nombre</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{insumo.nombre}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Descripción</span>
                                                                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{insumo.descripcion || "N/A"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Tipo de Materia</span>
                                                                    <span className="text-sm font-semibold text-gray-900">{insumo.tipoMateria === 'solido' ? 'Sólido' : 'Líquido'}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                    <span className="text-sm text-gray-600">Fecha de Ingreso</span>
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {new Date(insumo.fechaIngreso).toLocaleDateString('es-CO')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-green-600" />
                                                        Ubicación y Origen
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <InfoCard
                                                            label="Categoría"
                                                            value={insumo.categoria?.nombre}
                                                            icon={<Layers className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Proveedor"
                                                            value={insumo.proveedor?.nombre}
                                                            icon={<Package className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Almacén"
                                                            value={insumo.almacen?.nombre}
                                                            icon={<MapPin className="w-4 h-4" />}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </Tab>

                                    {/* STOCK TAB */}
                                    <Tab key="stock" title="Stock e Inventario">
                                        <div className="space-y-6 py-4">
                                            {/* Stock Status */}
                                            <Card shadow="sm" className={`border ${getStockColor() === 'danger' ? 'border-red-200 bg-red-50' : getStockColor() === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                                                <CardBody className="p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${getStockColor() === 'danger' ? 'text-red-900' : getStockColor() === 'warning' ? 'text-orange-900' : 'text-green-900'}`}>
                                                            {getStockColor() === 'danger' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                            Estado del Stock
                                                        </h3>
                                                        <Chip size="sm" color={getStockColor()} variant="flat">
                                                            {getStockStatus()}
                                                        </Chip>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Stock Físico (Uso)</p>
                                                            <p className="text-2xl font-bold text-gray-900">{insumo.stockUso} {insumo.presentacionUnidad}</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Stock Reservado</p>
                                                            <p className="text-2xl font-bold text-orange-600">{insumo.stockReservado || 0} {insumo.presentacionUnidad}</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                                            <p className="text-xs text-dim text-gray-600 uppercase font-semibold mb-1">Disponible Real</p>
                                                            <p className="text-2xl font-bold text-green-700">{insumo.stockUso - (insumo.stockReservado || 0)} {insumo.presentacionUnidad}</p>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            {/* Pricing */}
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <DollarSign className="w-5 h-5 text-green-600" />
                                                        Información de Precios
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InfoCard
                                                            label="Precio Unitario (Uso)"
                                                            value={formatCurrency(insumo.precioUnitarioUso || 0)}
                                                            icon={<DollarSign className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Precio Unitario (Presentación)"
                                                            value={formatCurrency(insumo.precioUnitarioPresentacion || 0)}
                                                            icon={<DollarSign className="w-4 h-4" />}
                                                        />
                                                    </div>
                                                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold text-gray-800 text-lg">Valor Total en Inventario</span>
                                                            <span className="text-2xl font-bold text-green-700">{formatCurrency(insumo.precioTotal || 0)}</span>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </Tab>

                                    {/* PRESENTATION TAB */}
                                    <Tab key="presentacion" title="Presentación y Conversión">
                                        <div className="space-y-6 py-4">
                                            <Card shadow="sm" className="border border-gray-200">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                        <Layers className="w-5 h-5 text-purple-600" />
                                                        Detalles de Presentación
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <InfoCard
                                                            label="Tipo de Presentación"
                                                            value={insumo.presentacionTipo}
                                                            icon={<Package className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Cantidad por Presentación"
                                                            value={`${insumo.presentacionCantidad} ${insumo.presentacionUnidad}`}
                                                            icon={<TrendingUp className="w-4 h-4" />}
                                                        />
                                                        <InfoCard
                                                            label="Unidad Base"
                                                            value={insumo.unidadBase}
                                                            icon={<Layers className="w-4 h-4" />}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            <Card shadow="sm" className="border border-blue-200 bg-blue-50">
                                                <CardBody className="p-4">
                                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                                        <TrendingUp className="w-5 h-5 text-blue-700" />
                                                        Factor de Conversión
                                                    </h3>
                                                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                                                        <div className="flex items-center justify-center gap-4">
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-600 mb-1">1 {insumo.presentacionUnidad}</p>
                                                                <p className="text-2xl font-bold text-blue-900">=</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-600 mb-1">Factor</p>
                                                                <p className="text-3xl font-bold text-blue-700">{insumo.factorConversion}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-bold text-blue-900">=</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-600 mb-1">Unidad Base</p>
                                                                <p className="text-2xl font-bold text-blue-900">{insumo.factorConversion} {insumo.unidadBase}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-center text-blue-700 mt-3">
                                                            Cada presentación de {insumo.presentacionCantidad} {insumo.presentacionUnidad} equivale a {insumo.factorConversion} {insumo.unidadBase} en unidad base
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>
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
