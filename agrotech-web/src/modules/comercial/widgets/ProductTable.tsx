import type { ProductoAgro } from '../models/types/production.types';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Spinner } from "@heroui/react";
import { Eye } from 'lucide-react';

import Surface from '../ui/Surface';

interface ProductTableProps {
    products: ProductoAgro[];
    isLoading: boolean;
    onEdit: (product: ProductoAgro) => void;
}

export const ProductTable = ({ products, isLoading, onEdit }: ProductTableProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Spinner color="success" label="Cargando productos..." />
            </div>
        );
    }

    if (!products.length) {
        return <div className="p-4 text-center text-gray-500">No hay productos registrados.</div>;
    }

    return (
        <Surface>
            <Table aria-label="Tabla de productos" removeWrapper className="[&_[data-slot=td]]:py-3">
                <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>UNIDAD BASE</TableColumn>
                    <TableColumn>DESCRIPCIÓN</TableColumn>
                    <TableColumn align="end">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={products}>
                    {(product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>{product.nombre}</TableCell>
                            <TableCell>{product.unidadBase}</TableCell>
                            <TableCell>{product.descripcion || '-'}</TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        color="success"
                                        isIconOnly
                                        className="text-black"
                                        onPress={() => onEdit(product)}
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
