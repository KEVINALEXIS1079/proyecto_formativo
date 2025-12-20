import { useState, forwardRef, useImperativeHandle } from 'react';
import { useVentas, useAnularVenta } from '../hooks/useSales';
import { SalesTable } from '../widgets/SalesTable';
import { SalesForm } from '../widgets/SalesForm';
import { SalesReceipt } from '../ui/SalesReceipt';
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
                title={`Detalle de Factura #${selectedVenta?.id?.toString().padStart(6, '0')}`}
                size="5xl"
            >
                {selectedVenta && (
                    <div className="space-y-6">
                        <SalesReceipt
                            venta={{
                                ...selectedVenta,
                                cliente: selectedVenta.cliente || { nombre: 'Cliente General' },
                                detalles: selectedVenta.detalles?.map(d => ({
                                    id: d.id,
                                    productoNombre: d.loteProduccion?.productoAgro?.nombre
                                        || d.loteProduccion?.cultivo?.nombre
                                        || `Lote #${d.loteProduccionId}`,
                                    cantidad: d.cantidadKg,
                                    precioUnitario: d.precioUnitarioKg,
                                    subtotal: d.subtotal
                                })) || []
                            }}
                        />
                        <div className="flex justify-end pt-2 px-8 pb-4">
                            <Button
                                variant="light"
                                color="danger"
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
