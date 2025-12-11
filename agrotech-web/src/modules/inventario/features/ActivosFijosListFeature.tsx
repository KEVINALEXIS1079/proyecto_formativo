import { useState, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Progress, Tooltip, Image, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getActivosFijos } from "../api/insumos.service";
import { Eye, Wrench, History } from "lucide-react";
import CreateActivoFijoModal from "../ui/CreateActivoFijoModal";
import { HistorialActivoFijoModal } from "../ui/HistorialActivoFijoModal";
import { MantenimientoActivoFijoModal } from "../ui/MantenimientoActivoFijoModal";
import { DarBajaModal } from "../ui/DarBajaModal";
import { ViewActivoFijoModal } from "../ui/ViewActivoFijoModal";
import { formatCurrency } from "@/shared/utils/formatters";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

export interface ActivosFijosListRef {
    openCreateModal: () => void;
}

export const ActivosFijosListFeature = forwardRef<ActivosFijosListRef>((_, ref) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);
    const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false);
    const [isBajaOpen, setIsBajaOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleOpenHistorial = (asset: any) => {
        setSelectedAsset(asset);
        setIsHistorialOpen(true);
    };

    const handleOpenMantenimiento = (asset: any) => {
        setSelectedAsset(asset);
        setIsMantenimientoOpen(true);
    };



    const handleOpenView = (asset: any) => {
        setSelectedAsset(asset);
        setIsViewModalOpen(true);
    };

    const { data: activos, isLoading } = useQuery({
        queryKey: ['activos-fijos'],
        queryFn: getActivosFijos
    });

    useImperativeHandle(ref, () => ({
        openCreateModal: () => setIsCreateModalOpen(true)
    }));

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'DISPONIBLE': return 'success';
            case 'EN_USO': return 'primary';
            case 'MANTENIMIENTO': return 'warning';
            case 'DADO_DE_BAJA': return 'danger';
            default: return 'default';
        }
    };

    const getVidaUtilColor = (porcentaje: number) => {
        if (porcentaje > 50) return "success";
        if (porcentaje > 20) return "warning";
        return "danger";
    };

    const columns = [
        { name: "IMAGEN", uid: "imagen" },
        { name: "ACTIVO", uid: "nombre" },
        { name: "ESTADO", uid: "estado" },
        { name: "VALOR LIBROS", uid: "valor" },
        { name: "VIDA ÚTIL", uid: "vida_util" },
        { name: "USO", uid: "uso" },
        { name: "ACCIONES", uid: "acciones" },
    ];

    if (isLoading) return (
        <div className="flex justify-center p-4">
            <Spinner color="success" label="Cargando activos..." />
        </div>
    );

    return (
        <div className="space-y-4">
            <Table aria-label="Tabla de Activos Fijos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={
                                column.uid === "acciones" || column.uid === "estado" || column.uid === "imagen" ? "center" :
                                    column.uid === "valor" ? "end" : "start"
                            }
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"No hay activos fijos registrados"}>
                    {(activos || []).map((activo: any) => {
                        // Calcular valor en libros = Costo - Depreciación Acumulada
                        const valorLibros = Math.max(0, (activo.costoAdquisicion || 0) - (activo.depreciacionAcumulada || 0));
                        const vidaUtilTotal = activo.vidaUtilHoras || 1;
                        const vidaUtilRestante = vidaUtilTotal - (activo.horasUsadas || 0);
                        const porcentajeVida = Math.max(0, (vidaUtilRestante / vidaUtilTotal) * 100);

                        return (
                            <TableRow key={activo.id}>
                                <TableCell>
                                    <div className="flex justify-center">
                                        {activo.fotoUrl ? (
                                            <Image
                                                src={
                                                    /^(data:|blob:|https?:\/\/)/i.test(activo.fotoUrl)
                                                        ? activo.fotoUrl
                                                        : `${FILES_BASE.replace(/\/+$/, "")}/${activo.fotoUrl.replace(/^\/+/, "")}`
                                                }
                                                alt={activo.nombre}
                                                width={40}
                                                height={40}
                                                className="object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <p className="font-medium text-sm capitalize">{activo.nombre}</p>
                                        <p className="text-tiny text-default-400 capitalize">{activo.categoria?.nombre || "Sin categoría"}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                        <Chip color={getEstadoColor(activo.estado || 'DISPONIBLE')} size="sm" variant="flat" className="capitalize">
                                            {(activo.estado || "DISPONIBLE").toLowerCase().replace(/_/g, ' ')}
                                        </Chip>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col items-end">
                                        <span className="text-bold text-sm">{formatCurrency(valorLibros)}</span>
                                        <span className="text-bold text-xs text-default-400">Orig: {formatCurrency(activo.costoAdquisicion || 0)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 w-full max-w-[140px]">
                                        <Progress
                                            aria-label="Vida útil restante"
                                            size="sm"
                                            value={porcentajeVida}
                                            color={getVidaUtilColor(porcentajeVida)}
                                        />
                                        <div className="flex justify-between text-xs text-default-400">
                                            <span>Restante</span>
                                            <span>{porcentajeVida.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-small">{activo.horasUsadas || 0} hrs</span>
                                        <span className="text-tiny text-default-400">de {activo.vidaUtilHoras} hrs</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="relative flex items-center justify-center gap-2">
                                        <Tooltip content="Ver detalles">
                                            <span
                                                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary"
                                                onClick={() => handleOpenView(activo)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </span>
                                        </Tooltip>

                                        <Tooltip content="Historial">
                                            <span
                                                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-blue-500"
                                                onClick={() => handleOpenHistorial(activo)}
                                            >
                                                <History className="w-4 h-4" />
                                            </span>
                                        </Tooltip>

                                        <Tooltip content="Mantenimiento">
                                            <span
                                                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-warning"
                                                onClick={() => handleOpenMantenimiento(activo)}
                                            >
                                                <Wrench className="w-4 h-4" />
                                            </span>
                                        </Tooltip>

                                        {/* 
                                        <Tooltip color="danger" content="Dar de baja">
                                            <span
                                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                                onClick={() => handleOpenBaja(activo)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </span>
                                        </Tooltip> 
                                        */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <CreateActivoFijoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ViewActivoFijoModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                activo={selectedAsset}
            />

            <HistorialActivoFijoModal
                isOpen={isHistorialOpen}
                onClose={() => setIsHistorialOpen(false)}
                activoFijoId={selectedAsset?.id}
                nombreActivo={selectedAsset?.nombre}
            />

            <MantenimientoActivoFijoModal
                isOpen={isMantenimientoOpen}
                onClose={() => setIsMantenimientoOpen(false)}
                activoFijoId={selectedAsset?.id}
                nombreActivo={selectedAsset?.nombre}
            />

            <DarBajaModal
                isOpen={isBajaOpen}
                onClose={() => setIsBajaOpen(false)}
                activoFijoId={selectedAsset?.id}
                nombreActivo={selectedAsset?.nombre}
            />
        </div>
    );
});

ActivosFijosListFeature.displayName = "ActivosFijosListFeature";
