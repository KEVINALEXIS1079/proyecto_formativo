import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip, Button, Tooltip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { reservasApi } from '../api/reservas.api';
import type { Reserva } from '../model/types';

export const ReservaListFeature: React.FC = () => {
    const queryClient = useQueryClient();
    const [procesandoId, setProcesandoId] = useState<number | null>(null);
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'liberar' | 'utilizar' | null>(null);

    // Fetch reservas
    const { data: reservas = [], isLoading } = useQuery({
        queryKey: ['reservas'],
        queryFn: reservasApi.getAll,
    });

    // Mutations
    const liberarMutation = useMutation({
        mutationFn: reservasApi.liberar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservas'] });
            queryClient.invalidateQueries({ queryKey: ['insumos'] }); // Actualizar stock de insumos
            closeModal();
        },
        onError: (error) => {
            console.error('Error al liberar reserva:', error);
            alert('Error al liberar la reserva');
        }
    });

    const utilizarMutation = useMutation({
        mutationFn: reservasApi.utilizar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservas'] });
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            closeModal();
        },
        onError: (error) => {
            console.error('Error al utilizar reserva:', error);
            alert('Error al procesar el uso de la reserva');
        }
    });

    const handleAction = (reserva: Reserva, type: 'liberar' | 'utilizar') => {
        setSelectedReserva(reserva);
        setActionType(type);
        setActionModalOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedReserva || !actionType) return;

        setProcesandoId(selectedReserva.id);
        try {
            if (actionType === 'liberar') {
                await liberarMutation.mutateAsync(selectedReserva.id);
            } else {
                await utilizarMutation.mutateAsync(selectedReserva.id);
            }
        } finally {
            setProcesandoId(null);
        }
    };

    const closeModal = () => {
        setActionModalOpen(false);
        setSelectedReserva(null);
        setActionType(null);
    };

    const getEstadoColor = (estado: Reserva['estado']) => {
        switch (estado) {
            case 'ACTIVA': return 'primary';
            case 'UTILIZADA': return 'success';
            case 'LIBERADA': return 'default'; // Gray/Neutral
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner label="Cargando reservas..." color="primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Reservas de Inventario</h2>
                <div className="flex gap-2">
                    {/* Add filters here later if needed */}
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <Table
                    aria-label="Tabla de reservas"
                    removeWrapper
                    className="bg-white"
                >
                    <TableHeader>
                        <TableColumn>INSUMO / ACTIVO</TableColumn>
                        <TableColumn>CANTIDAD</TableColumn>
                        <TableColumn>SOLICITANTE</TableColumn>
                        <TableColumn>FECHA RESERVA</TableColumn>
                        <TableColumn>MOTIVO</TableColumn>
                        <TableColumn>ESTADO</TableColumn>
                        <TableColumn align="center">ACCIONES</TableColumn>
                    </TableHeader>
                    <TableBody items={reservas} emptyContent="No hay reservas registradas">
                        {(item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{item.insumo?.nombre || 'Insumo Eliminado'}</span>
                                        <span className="text-xs text-gray-500">ID: {item.id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{item.cantidad}</span>
                                        <span className="text-gray-500 text-xs">{item.insumo?.presentacionUnidad || 'Unidades'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{item.usuarioId ? `Usuario #${item.usuarioId} ` : 'Sistema'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(item.fechaReserva).toLocaleDateString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="truncate max-w-[200px] block text-gray-600" title={item.motivo}>
                                        {item.motivo}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        color={getEstadoColor(item.estado)}
                                        variant="flat"
                                        size="sm"
                                        className="capitalize"
                                    >
                                        {item.estado.toLowerCase()}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center items-center gap-2">
                                        {item.estado === 'ACTIVA' && (
                                            <>
                                                <Tooltip content="Utilizar Reserva (Salida de Stock)">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="success"
                                                        variant="light"
                                                        onPress={() => handleAction(item, 'utilizar')}
                                                        isDisabled={procesandoId === item.id}
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Liberar Reserva (Devolver al Disponible)">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        color="warning"
                                                        variant="light"
                                                        onPress={() => handleAction(item, 'liberar')}
                                                        isDisabled={procesandoId === item.id}
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </Button>
                                                </Tooltip>
                                            </>
                                        )}
                                        {item.estado !== 'ACTIVA' && (
                                            <span className="text-gray-400 text-xs italic">
                                                {item.estado === 'UTILIZADA' ? 'Procesada' : 'Liberada'}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={actionModalOpen} onClose={closeModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {actionType === 'utilizar' ? 'Confirmar Uso de Reserva' : 'Liberar Reserva'}
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    {actionType === 'utilizar'
                                        ? `¿Estás seguro de que deseas utilizar esta reserva ? Esto descontará ${selectedReserva?.cantidad} unidades del stock físico de "${selectedReserva?.insumo?.nombre}".`
                                        : `¿Estás seguro de liberar esta reserva ? Las ${selectedReserva?.cantidad} unidades reservadas de "${selectedReserva?.insumo?.nombre}" volverán a estar disponibles.`
                                    }
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color={actionType === 'utilizar' ? 'success' : 'warning'}
                                    onPress={confirmAction}
                                    isLoading={!!procesandoId}
                                >
                                    {actionType === 'utilizar' ? 'Confirmar Uso' : 'Liberar Stock'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
