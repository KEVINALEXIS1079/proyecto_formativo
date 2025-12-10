import type { Cliente } from '../models/types/sales.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import Surface from '../ui/Surface';

interface ClientTableProps {
    clientes: Cliente[];
    isLoading: boolean;
    onEdit: (cliente: Cliente) => void;
}

export const ClientTable = ({ clientes, isLoading, onEdit }: ClientTableProps) => {
    if (isLoading) {
        return <div className="p-4 text-center">Cargando clientes...</div>;
    }

    if (!clientes.length) {
        return <div className="p-4 text-center text-gray-500">No hay clientes registrados.</div>;
    }

    return (
        <Surface>
            <Table aria-label="Tabla de clientes" removeWrapper className="[&_[data-slot=td]]:py-3">
                <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>IDENTIFICACIÓN</TableColumn>
                    <TableColumn>TELÉFONO</TableColumn>
                    <TableColumn>CORREO</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={clientes}>
                    {(cliente) => (
                        <TableRow key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>{cliente.nombre}</TableCell>
                            <TableCell>{cliente.identificacion || '-'}</TableCell>
                            <TableCell>{cliente.telefono || '-'}</TableCell>
                            <TableCell>{cliente.correo || '-'}</TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        color="success"
                                        className="text-black font-semibold"
                                        onPress={() => onEdit(cliente)}
                                    >
                                        Gestionar
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Surface>
    );
};
