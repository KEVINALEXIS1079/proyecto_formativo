import { useLotesProduccion, QK_PRODUCTION } from "../hooks/useProduction";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip,
    Button,
    Tooltip
} from "@heroui/react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, History, Image as ImageIcon } from "lucide-react";
import EditLoteModal from "./EditLoteModal";
import PriceHistoryModal from "./PriceHistoryModal";
import ProductImageModal from "./ProductImageModal";
import type { LoteProduccion, ProductoAgro } from "../api/production.service";
import { getImageUrl } from "../utils/image-helper";

export default function ProductionInventory() {
    const { data: lotes = [], isLoading } = useLotesProduccion();
    const [editingLote, setEditingLote] = useState<LoteProduccion | null>(null);
    const [historyLoteId, setHistoryLoteId] = useState<number | null>(null);
    const [imageProduct, setImageProduct] = useState<ProductoAgro | null>(null);
    const queryClient = useQueryClient();

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
                    <TableColumn>IMAGEN</TableColumn>
                    <TableColumn>PRODUCTO</TableColumn>
                    <TableColumn>CULTIVO ORIGEN</TableColumn>
                    <TableColumn>STOCK DISPONIBLE</TableColumn>
                    <TableColumn>PRECIO UNITARIO</TableColumn>
                    <TableColumn>CALIDAD</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay lotes de producción">
                    {lotes.map(lote => (
                        <TableRow key={lote.id}>
                            <TableCell>
                                <div 
                                    className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden cursor-pointer border border-gray-200"
                                    onClick={() => lote.productoAgro && setImageProduct(lote.productoAgro)}
                                >
                                    {(lote.productoAgro as any)?.imagen ? (
                                        <img 
                                            src={getImageUrl((lote.productoAgro as any).imagen)} 
                                            alt={lote.productoAgro?.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold text-lg">{lote.productoAgro?.nombre}</div>
                            </TableCell>
                            <TableCell>
                                <span className="text-gray-600">{(lote.cultivo as any)?.nombre || (lote.cultivo as any)?.nombreCultivo || lote.cultivoId || "N/A"}</span>
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
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-blue-700">
                                        {lote.calidad || "ESTANDAR"}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {lote.stockDisponibleKg > 0 ? (
                                    <Chip color="success" variant="flat" size="sm">DISPONIBLE</Chip>
                                ) : (
                                    <Chip color="danger" variant="flat" size="sm">AGOTADO</Chip>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Tooltip content="Gestionar Imagen">
                                        <Button 
                                            isIconOnly 
                                            size="sm" 
                                            variant="light" 
                                            onPress={() => lote.productoAgro && setImageProduct(lote.productoAgro)}
                                        >
                                            <ImageIcon size={18} className="text-gray-500" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Ver Historial de Precios">
                                        <Button 
                                            isIconOnly 
                                            size="sm" 
                                            variant="light" 
                                            onPress={() => setHistoryLoteId(lote.id)}
                                        >
                                            <History size={18} className="text-gray-500" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Editar Precio/Calidad">
                                        <Button 
                                            isIconOnly 
                                            size="sm" 
                                            variant="light" 
                                            onPress={() => setEditingLote(lote)}
                                        >
                                            <Pencil size={18} className="text-gray-500" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            <EditLoteModal 
                isOpen={!!editingLote} 
                onClose={() => setEditingLote(null)} 
                lote={editingLote}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] });
                }}
            />

            <PriceHistoryModal
                isOpen={!!historyLoteId}
                onClose={() => setHistoryLoteId(null)}
                loteId={historyLoteId}
            />

            <ProductImageModal
                isOpen={!!imageProduct}
                onClose={() => setImageProduct(null)}
                producto={imageProduct}
            />
        </div>
    );
}
