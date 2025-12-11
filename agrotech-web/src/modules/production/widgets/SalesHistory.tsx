import { useVentas, useAnularVenta } from "../hooks/useProduction";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Tooltip,
    Spinner
} from "@heroui/react";
import { format } from "date-fns";
// import { es } from "date-fns/locale";
import { Eye, Undo2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SalesHistory() {
    const { data: ventas = [], isLoading } = useVentas();
    const anularMutation = useAnularVenta();

    const handleAnular = async (id: number) => {
        if (!confirm("¿Está seguro de anular esta venta? El stock será devuelto.")) return;
        try {
            await anularMutation.mutateAsync(id);
            toast.success("Venta anulada correctamente");
        } catch (e) {
            toast.error("Error al anular venta");
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Historial de Ventas</h2>
                    <p className="text-gray-500">Registro de todas las transacciones realizadas</p>
                </div>
            </div>

            <Table aria-label="Historial de Ventas" selectionMode="none">
                <TableHeader>
                    <TableColumn>ID VENTA</TableColumn>
                    <TableColumn>FECHA</TableColumn>
                    <TableColumn>CLIENTE</TableColumn>
                    <TableColumn>ITEMS</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay ventas registradas">
                    {ventas.map((venta) => (
                        <TableRow key={venta.id}>
                            <TableCell>
                                <span className="font-mono text-xs">#{String(venta.id).padStart(6, '0')}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm">{format(new Date(venta.fecha), "dd MMM yyyy")}</span>
                                    <span className="text-xs text-gray-400">{format(new Date(venta.fecha), "HH:mm")}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{venta.cliente?.nombre || "Consumidor Final"}</span>
                                    {venta.cliente?.identificacion && <span className="text-xs text-gray-400">{venta.cliente.identificacion}</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm">{venta.detalles?.length || 0} productos</span>
                            </TableCell>
                            <TableCell>
                                <span className="font-bold text-green-600">${venta.total.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    color={venta.estado === 'completada' ? 'success' : 'danger'}
                                    variant="flat"
                                    size="sm"
                                >
                                    {venta.estado.toUpperCase()}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Tooltip content="Ver Detalle (Próximamente)">
                                        <Button isIconOnly size="sm" variant="light"><Eye size={18} /></Button>
                                    </Tooltip>
                                    {venta.estado === 'completada' && (
                                        <Tooltip color="danger" content="Anular Venta">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                color="danger"
                                                variant="light"
                                                onPress={() => handleAnular(venta.id)}
                                                isLoading={anularMutation.isPending}
                                            >
                                                <Undo2 size={18} />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
