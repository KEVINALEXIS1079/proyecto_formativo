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
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Cliente:</span> {selectedVenta.cliente?.nombre || 'General'}
                            </div>
                            <div>
                                <span className="font-semibold">Fecha:</span> {new Date(selectedVenta.fecha).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-semibold">Estado:</span> {selectedVenta.estado.toUpperCase()}
                            </div>
                            <div>
                                <span className="font-semibold">Vendedor ID:</span> {selectedVenta.usuarioId}
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-zinc-800 text-left">
                                    <tr>
                                        <th className="p-2">Producto</th>
                                        <th className="p-2 text-right">Cant.</th>
                                        <th className="p-2 text-right">Precio</th>
                                        <th className="p-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedVenta.detalles?.map(d => (
                                        <tr key={d.id} className="border-t border-gray-100 dark:border-zinc-800">
                                            <td className="p-2">{d.loteProduccionId} (ID Lote)</td>
                                            <td className="p-2 text-right">{d.cantidadKg} kg</td>
                                            <td className="p-2 text-right">${(d.precioUnitarioKg || 0).toLocaleString()}</td>
                                            <td className="p-2 text-right">${(d.subtotal || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <div className="text-right space-y-1">
                                <div>Subtotal: ${selectedVenta.subtotal.toLocaleString()}</div>
                                <div>IVA: ${selectedVenta.impuestos.toLocaleString()}</div>
                                <div className="text-xl font-bold">Total: ${selectedVenta.total.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button onPress={() => setIsViewModalOpen(false)}>Cerrar</Button>
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
