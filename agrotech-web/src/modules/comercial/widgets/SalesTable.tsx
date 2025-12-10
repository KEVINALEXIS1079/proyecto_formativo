import type { Venta } from '../models/types/sales.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@heroui/react";
import { Ban, Eye } from 'lucide-react';
import Surface from '../ui/Surface';

interface SalesTableProps {
    ventas: Venta[];
    isLoading: boolean;
    onView: (venta: Venta) => void;
    onAnular: (venta: Venta) => void;
}

export const SalesTable = ({ ventas, isLoading, onView, onAnular }: SalesTableProps) => {
    if (isLoading) {
        return <div className="p-4 text-center">Cargando ventas...</div>;
    }

    if (!ventas.length) {
        return <div className="p-4 text-center text-gray-500">No hay ventas registradas.</div>;
    }

    return (
        <Surface>
            <Table aria-label="Tabla de ventas" removeWrapper className="[&_[data-slot=td]]:py-3">
                <TableHeader>
                    <TableColumn># VENTA</TableColumn>
                    <TableColumn>FECHA</TableColumn>
                    <TableColumn>CLIENTE</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={ventas}>
                    {(venta) => (
                        <TableRow key={venta.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>#{venta.id}</TableCell>
                            <TableCell>{new Date(venta.fecha).toLocaleDateString()} {new Date(venta.fecha).toLocaleTimeString()}</TableCell>
                            <TableCell>{venta.cliente?.nombre || 'Cliente General'}</TableCell>
                            <TableCell className="font-medium">${venta.total.toLocaleString()}</TableCell>
                            <TableCell>
                                <Chip
                                    color={venta.estado === 'completada' ? 'success' : venta.estado === 'anulada' ? 'danger' : 'warning'}
                                    size="sm"
                                    variant="flat"
                                >
                                    {venta.estado.toUpperCase()}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        color="success"
                                        isIconOnly
                                        className="text-black"
                                        onPress={() => onView(venta)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {venta.estado !== 'anulada' && (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            className="text-danger"
                                            onPress={() => onAnular(venta)}
                                            title="Anular Venta"
                                        >
                                            <Ban className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Surface>
    );
};
