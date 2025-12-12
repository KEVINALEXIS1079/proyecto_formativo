import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@heroui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { productionApi } from "../api/production.service";

interface PriceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    loteId: number | null;
}

interface HistoryEntry {
    id: number;
    precioAnterior: number;
    precioNuevo: number;
    fecha: string;
    usuario: { nombre: string; };
    razon?: string;
}

export default function PriceHistoryModal({ isOpen, onClose, loteId }: PriceHistoryModalProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && loteId) {
            loadHistory();
        }
    }, [isOpen, loteId]);

    const loadHistory = async () => {
        if (!loteId) return;
        setIsLoading(true);
        try {
            const data = await productionApi.getHistorialPrecios(loteId);
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Historial de Precios
                            <span className="text-xs font-normal text-gray-500">Lote #{loteId}</span>
                        </ModalHeader>
                        <ModalBody>
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Spinner />
                                </div>
                            ) : (
                                <Table aria-label="Historial de precios">
                                    <TableHeader>
                                        <TableColumn>FECHA</TableColumn>
                                        <TableColumn>USUARIO</TableColumn>
                                        <TableColumn>PRECIO ANT.</TableColumn>
                                        <TableColumn>PRECIO NUEVO</TableColumn>
                                        <TableColumn>CAMBIO</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No hay historial de cambios de precio.">
                                        {history.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{format(new Date(item.fecha), "dd MMM yyyy")}</span>
                                                        <span className="text-xs text-gray-400">{format(new Date(item.fecha), "HH:mm")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.usuario?.nombre || "N/A"}</TableCell>
                                                <TableCell className="text-gray-500">${item.precioAnterior.toLocaleString()}</TableCell>
                                                <TableCell className="font-bold">${item.precioNuevo.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {item.precioNuevo > item.precioAnterior ? (
                                                        <span className="text-green-600 text-xs">▲ Subió</span>
                                                    ) : (
                                                        <span className="text-red-600 text-xs">▼ Bajó</span>
                                                    )}
                                                </TableCell>
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
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
