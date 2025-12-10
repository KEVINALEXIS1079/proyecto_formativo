import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getMovimientosByInsumo } from "../api/insumos.service";
import { formatDateTime } from "@/shared/utils/formatters";

interface HistorialActivoFijoModalProps {
    isOpen: boolean;
    onClose: () => void;
    activoFijoId: number | null;
    nombreActivo?: string;
}

export const HistorialActivoFijoModal: React.FC<HistorialActivoFijoModalProps> = ({
    isOpen,
    onClose,
    activoFijoId,
    nombreActivo,
}) => {
    const { data: movimientos, isLoading } = useQuery({
        queryKey: ["movimientos", activoFijoId],
        queryFn: () => (activoFijoId ? getMovimientosByInsumo(activoFijoId) : Promise.resolve([])),
        enabled: !!activoFijoId && isOpen,
    });

    const getMovimientoColor = (tipo: string) => {
        switch (tipo) {
            case 'REGISTRO_USO': return 'primary';
            case 'MANTENIMIENTO': return 'warning';
            case 'ALTA': return 'success';
            case 'BAJA': return 'danger';
            default: return 'default';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Historial de Uso - {nombreActivo}
                </ModalHeader>
                <ModalBody>
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Spinner />
                        </div>
                    ) : (
                        <Table aria-label="Historial de movimientos">
                            <TableHeader>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn align="center">TIPO</TableColumn>
                                <TableColumn align="end">CANTIDAD (HORAS)</TableColumn>
                                <TableColumn>ACTIVIDAD</TableColumn>
                                <TableColumn>DESCRIPCIÓN</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No hay movimientos registrados.">
                                {(movimientos || []).map((mov: any) => (
                                    <TableRow key={mov.id}>
                                        <TableCell>{formatDateTime(mov.createdAt || mov.fecha)}</TableCell>
                                        <TableCell>
                                            <Chip color={getMovimientoColor(mov.tipo)} size="sm" variant="flat" className="capitalize">
                                                {(mov.tipo || "").toLowerCase().replace(/_/g, ' ')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-right font-mono">
                                                {mov.cantidadUso}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {mov.actividad ? (
                                                <div className="flex flex-col">
                                                    <span className="text-small">{mov.actividad.nombre}</span>
                                                    <span className="text-tiny text-default-400">{mov.actividad.tipo}</span>
                                                </div>
                                            ) : (
                                                <span className="text-default-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{mov.descripcion}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
