import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
} from '@heroui/react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Insumo } from '../model/types';
import { reservasApi } from '../api/reservas.api';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Calendar } from 'lucide-react';

interface CreateReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    insumo: Insumo | null;
}

export const CreateReservaModal = ({
    isOpen,
    onClose,
    insumo,
}: CreateReservaModalProps) => {
    const queryClient = useQueryClient();
    const [cantidad, setCantidad] = useState('1');
    const [motivo, setMotivo] = useState('');
    const [fechaReserva, setFechaReserva] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: reservasApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            queryClient.invalidateQueries({ queryKey: ['reservas'] }); // Future list
            onClose();
            // Reset form
            setCantidad('1');
            setMotivo('');
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al crear la reserva');
        }
    });

    const handleSubmit = () => {
        if (!insumo) return;
        setError(null);

        // Validar cantidad
        const qty = parseFloat(cantidad);
        const stockDisponible = insumo.stockUso - (insumo.stockReservado || 0);

        // Para Activo Fijo (tipo NO_CONSUMIBLE), si es único, stockUso es 1.
        // Si es consumible, stockUso es N.

        // Validación básica front (el back tiene la robusta)
        if (qty <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        if (insumo.tipoInsumo === 'CONSUMIBLE' && qty > stockDisponible) {
            setError(`Stock insuficiente. Disponible: ${stockDisponible}`);
            return;
        }

        createMutation.mutate({
            insumoId: insumo.id,
            cantidad: qty,
            motivo,
            fechaReserva: new Date(fechaReserva).toISOString(),
        });
    };

    if (!insumo) return null;

    const isActivoFijo = insumo.tipoInsumo === 'NO_CONSUMIBLE';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-100">
                            <h2 className="text-xl font-bold">Nueva Reserva</h2>
                            <p className="text-sm text-gray-500">
                                Reservar {isActivoFijo ? 'Activo Fijo' : 'Insumo'}: {insumo.nombre}
                            </p>
                        </ModalHeader>
                        <ModalBody className="py-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado Actual</h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Stock Físico:</span>
                                                <span className="font-medium">{insumo.stockUso} {insumo.presentacionUnidad}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Reservado:</span>
                                                <span className="font-medium text-orange-600">{insumo.stockReservado || 0} {insumo.presentacionUnidad}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                                <span>Disponible:</span>
                                                <span className="font-bold text-green-700">{insumo.stockUso - (insumo.stockReservado || 0)} {insumo.presentacionUnidad}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Input
                                        label="Fecha de Reserva"
                                        type="date"
                                        value={fechaReserva}
                                        onChange={(e) => setFechaReserva(e.target.value)}
                                        variant="bordered"
                                        startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        label="Cantidad a Reservar"
                                        type="number"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)}
                                        variant="bordered"
                                        min={1}
                                        max={insumo.stockUso - (insumo.stockReservado || 0)}
                                        description={isActivoFijo ? "Generalmente 1 unidad para activos específicos" : `Máximo disponible: ${insumo.stockUso - (insumo.stockReservado || 0)}`}
                                    />

                                    <Textarea
                                        label="Motivo del Uso"
                                        placeholder="Descripción breve de para qué se utilizará..."
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        variant="bordered"
                                        minRows={3}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-100">
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={createMutation.isPending}
                                className="bg-black text-white"
                            >
                                Confirmar Reserva
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
