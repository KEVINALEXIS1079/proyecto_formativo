import { Card, CardBody, Button, Divider } from '@heroui/react';
import { Printer, Download } from 'lucide-react';
import { useRef } from 'react';

interface VentaDetalle {
    id: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

interface Cliente {
    nombre: string;
    identificacion?: string;
    telefono?: string;
    direccion?: string;
}

interface SalesReceiptProps {
    venta: {
        id: number;
        fecha: string;
        cliente: Cliente;
        detalles: VentaDetalle[];
        subtotal: number;
        impuestos: number;
        descuento: number;
        total: number;
    };
}

export function SalesReceipt({ venta }: SalesReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // Trigger print dialog which can save as PDF
        window.print();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            {/* Print Buttons - Hidden when printing */}
            <div className="flex gap-2 print:hidden">
                <Button
                    color="primary"
                    startContent={<Printer className="h-4 w-4" />}
                    onPress={handlePrint}
                >
                    Imprimir
                </Button>
                <Button
                    color="success"
                    variant="flat"
                    startContent={<Download className="h-4 w-4" />}
                    onPress={handleDownloadPDF}
                >
                    Descargar PDF
                </Button>
            </div>

            {/* Receipt Content */}
            <Card ref={receiptRef} className="max-w-2xl mx-auto print:shadow-none print:border-none">
                <CardBody className="p-8">
                    {/* Header with Logo */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-success-600 text-white px-6 py-3 rounded-lg">
                                <h1 className="text-2xl font-bold">TIC YAMBORO</h1>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Sistema de Gestión Agropecuaria</p>
                        <p className="text-xs text-gray-500 mt-1">NIT: 900.123.456-7</p>
                    </div>

                    <Divider className="my-4" />

                    {/* Receipt Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Tiquete de Venta</p>
                            <p className="text-lg font-bold text-success-600">#{venta.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">Fecha</p>
                            <p className="text-sm">{formatDate(venta.fecha)}</p>
                        </div>
                    </div>

                    <Divider className="my-4" />

                    {/* Client Info */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Datos del Cliente</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-1">
                            <p className="text-sm"><span className="font-semibold">Nombre:</span> {venta.cliente.nombre}</p>
                            {venta.cliente.identificacion && (
                                <p className="text-sm"><span className="font-semibold">Identificación:</span> {venta.cliente.identificacion}</p>
                            )}
                            {venta.cliente.telefono && (
                                <p className="text-sm"><span className="font-semibold">Teléfono:</span> {venta.cliente.telefono}</p>
                            )}
                            {venta.cliente.direccion && (
                                <p className="text-sm"><span className="font-semibold">Dirección:</span> {venta.cliente.direccion}</p>
                            )}
                        </div>
                    </div>

                    <Divider className="my-4" />

                    {/* Sale Details */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Detalle de la Venta</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left py-2">Producto</th>
                                    <th className="text-center py-2">Cant.</th>
                                    <th className="text-right py-2">P. Unit.</th>
                                    <th className="text-right py-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venta.detalles.map((detalle) => (
                                    <tr key={detalle.id} className="border-b border-gray-200">
                                        <td className="py-3">{detalle.productoNombre}</td>
                                        <td className="text-center py-3">{detalle.cantidad}</td>
                                        <td className="text-right py-3">{formatCurrency(detalle.precioUnitario)}</td>
                                        <td className="text-right py-3 font-semibold">{formatCurrency(detalle.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Divider className="my-4" />

                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">{formatCurrency(venta.subtotal)}</span>
                        </div>
                        {venta.impuestos > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Impuestos:</span>
                                <span className="font-semibold">{formatCurrency(venta.impuestos)}</span>
                            </div>
                        )}
                        {venta.descuento > 0 && (
                            <div className="flex justify-between text-sm text-success-600">
                                <span>Descuento:</span>
                                <span className="font-semibold">-{formatCurrency(venta.descuento)}</span>
                            </div>
                        )}
                        <Divider className="my-2" />
                        <div className="flex justify-between text-lg">
                            <span className="font-bold text-gray-800">TOTAL:</span>
                            <span className="font-bold text-success-600 text-xl">{formatCurrency(venta.total)}</span>
                        </div>
                    </div>

                    <Divider className="my-6" />

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500 space-y-1">
                        <p>¡Gracias por su compra!</p>
                        <p>TIC Yamboro - Sistema de Gestión Agropecuaria</p>
                        <p className="mt-2">Este documento es un comprobante de venta</p>
                    </div>
                </CardBody>
            </Card>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}
