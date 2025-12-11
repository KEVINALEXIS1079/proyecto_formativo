import { useLotesProduccion } from "../hooks/useProduction";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip
} from "@heroui/react";

export default function ProductionInventory() {
    const { data: lotes = [], isLoading } = useLotesProduccion();

    if (isLoading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Inventario de Producción</h2>
                    <p className="text-gray-500">Lotes de productos terminados disponibles para venta</p>
                </div>
            </div>

            <Table aria-label="Inventario Producción">
                <TableHeader>
                    <TableColumn>PRODUCTO</TableColumn>
                    <TableColumn>CULTIVO ORIGEN</TableColumn>
                    <TableColumn>STOCK DISPONIBLE</TableColumn>
                    <TableColumn>PRECIO UNITARIO</TableColumn>
                    <TableColumn>CALIDAD</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay lotes de producción">
                    {lotes.map(lote => (
                        <TableRow key={lote.id}>
                            <TableCell>
                                <div className="font-semibold text-lg">{lote.productoAgro?.nombre}</div>
                            </TableCell>
                            <TableCell>
                                <span className="text-gray-600">{lote.cultivo?.nombre || "N/A"}</span>
                            </TableCell>
                            <TableCell>
                                <div className="font-bold text-lg">
                                    {lote.stockDisponibleKg} <span className="text-xs font-normal text-gray-500">kg</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-mono text-green-700 font-semibold">
                                    ${lote.precioSugeridoKg.toLocaleString()}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" variant="dot" color="primary">Standard</Chip>
                            </TableCell>
                            <TableCell>
                                {lote.stockDisponibleKg > 0 ? (
                                    <Chip color="success" variant="flat" size="sm">DISPONIBLE</Chip>
                                ) : (
                                    <Chip color="danger" variant="flat" size="sm">AGOTADO</Chip>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
