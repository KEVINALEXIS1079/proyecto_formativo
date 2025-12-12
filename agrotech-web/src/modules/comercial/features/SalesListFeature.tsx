import { useState, forwardRef, useImperativeHandle } from 'react';
import { useVentas, useAnularVenta } from '../hooks/useSales';
import { SalesTable } from '../widgets/SalesTable';
import { SalesForm } from '../widgets/SalesForm';
import { Modal } from '@/shared/components/ui/Modal';
import { DeleteModal } from '@/shared/components/ui/DeleteModal';
import type { Venta } from '../models/types/sales.types';
import { Button } from '@heroui/react';

export interface SalesListRef {
    openCreateModal: () => void;
}

export const SalesListFeature = forwardRef<SalesListRef>((_, ref) => {
    const { data: ventas = [], isLoading } = useVentas();
    const anularMutation = useAnularVenta();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [ventaToAnular, setVentaToAnular] = useState<Venta | null>(null);

    useImperativeHandle(ref, () => ({
        openCreateModal: () => {
            setSelectedVenta(null);
            setIsModalOpen(true);
        },
    }));

    const handleView = (venta: Venta) => {
        setSelectedVenta(venta);
        setIsViewModalOpen(true);
    };

    const handleAnularAttempt = (venta: Venta) => {
        setVentaToAnular(venta);
    };

    const confirmAnular = async () => {
        if (ventaToAnular) {
            await anularMutation.mutateAsync(ventaToAnular.id);
            setVentaToAnular(null);
        }
    };

    return (
        <div className="flex flex-col">
            <SalesTable
                ventas={ventas}
                isLoading={isLoading}
                onView={handleView}
                onAnular={handleAnularAttempt}
            />

            {/* Create Sale Modal (POS) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Venta (Punto de Venta)"
                size="4xl"
            >
                <div className="h-[70vh]">
                    <SalesForm
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => setIsModalOpen(false)}
                    />
                </div>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedVenta(null);
                }}
                title={`Detalle de Venta #${selectedVenta?.id}`}
                size="2xl"
            >
                {selectedVenta && (
                    <div className="space-y-6 p-1">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cliente</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVenta.cliente?.nombre || 'Cliente General'}</p>
                                {selectedVenta.cliente?.identificacion && <p className="text-xs text-gray-500">{selectedVenta.cliente.identificacion}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Fecha de Emisión</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {new Date(selectedVenta.fecha).toLocaleDateString('es-CO', {
                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Estado</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${selectedVenta.estado === 'completada' ? 'green' : 'yellow'}-100 text-${selectedVenta.estado === 'completada' ? 'green' : 'yellow'}-800`}>
                                    {selectedVenta.estado.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Vendedor</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">ID: {selectedVenta.usuarioId}</p>
                            </div>
                        </div>

                        {/* Product Table */}
                        <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Producto / Lote</th>
                                        <th className="px-4 py-3 text-right">Cantidad</th>
                                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                    {selectedVenta.detalles?.map(d => {
                                        const nombreProducto = d.loteProduccion?.productoAgro?.nombre
                                            || d.loteProduccion?.cultivo?.nombre
                                            || `Lote #${d.loteProduccionId}`;

                                        return (
                                            <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{nombreProducto}</div>
                                                    <div className="text-xs text-gray-500">REF: {d.loteProduccionId}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-600">{d.cantidadKg} kg</td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-600">${(d.precioUnitarioKg || 0).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">${(d.subtotal || 0).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end pt-2">
                            <div className="w-1/2 space-y-3 bg-gray-50 dark:bg-zinc-800/30 p-4 rounded-xl">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${selectedVenta.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Impuestos</span>
                                    <span>${selectedVenta.impuestos.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-zinc-700 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">Total</span>
                                    <span className="font-bold text-green-600 text-xl">${selectedVenta.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="light"
                                color="primary"
                                onPress={() => setIsViewModalOpen(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Anular Confirmation Modal */}
            <DeleteModal
                isOpen={!!ventaToAnular}
                onClose={() => setVentaToAnular(null)}
                onConfirm={confirmAnular}
                title="Anular Venta"
                description={`¿Estás seguro de anular la venta #${ventaToAnular?.id}? Esto revertirá el stock de los productos.`}
                isLoading={anularMutation.isPending}
                confirmText="Sí, Anular Venta"
                confirmColor="danger"
            />
        </div>
    );
});

SalesListFeature.displayName = 'SalesListFeature';
