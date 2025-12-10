import type { LoteProduccion } from '../models/types/production.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { Eye } from 'lucide-react';

import Surface from '../ui/Surface';

interface LoteTableProps {
    lotes: LoteProduccion[];
    isLoading: boolean;
    onEdit: (lote: LoteProduccion) => void;
}

export const LoteTable = ({ lotes, isLoading, onEdit }: LoteTableProps) => {
    if (isLoading) {
        return <div className="p-4 text-center">Cargando lotes...</div>;
    }

    if (!lotes.length) {
        return <div className="p-4 text-center text-gray-500">No hay lotes de producción registrados.</div>;
    }

    return (
        <Surface>
            <Table aria-label="Tabla de lotes" removeWrapper className="[&_[data-slot=td]]:py-3">
                <TableHeader>
                    <TableColumn>PRODUCTO</TableColumn>
                    <TableColumn>CULTIVO</TableColumn>
                    <TableColumn>CALIDAD</TableColumn>
                    <TableColumn>STOCK (KG)</TableColumn>
                    <TableColumn>COSTO UNITARIO</TableColumn>
                    <TableColumn>PRECIO SUGERIDO</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={lotes}>
                    {(lote) => (
                        <TableRow key={lote.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>{lote.productoAgro?.nombre || '-'}</TableCell>
                            <TableCell>{lote.cultivoId || '-'}</TableCell>
                            <TableCell>{lote.calidad}</TableCell>
                            <TableCell>{lote.stockDisponibleKg}</TableCell>
                            <TableCell>${lote.costoUnitarioKg.toFixed(2)}</TableCell>
                            <TableCell>${lote.precioSugeridoKg.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        color="success"
                                        isIconOnly
                                        className="text-black"
                                        onPress={() => onEdit(lote)}
                                    >
                                        <Eye className="h-4 w-4" />
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
