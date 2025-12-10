import { useState, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Progress, Tooltip, User } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getActivosFijos } from "../api/insumos.service";
import { Eye, Trash2, Wrench } from "lucide-react";
import CreateActivoFijoModal from "../ui/CreateActivoFijoModal";
import { HistorialActivoFijoModal } from "../ui/HistorialActivoFijoModal";
import { MantenimientoActivoFijoModal } from "../ui/MantenimientoActivoFijoModal";
import { DarBajaModal } from "../ui/DarBajaModal";
import { formatCurrency } from "@/shared/utils/formatters";

export interface ActivosFijosListRef {
    openCreateModal: () => void;
}

export const ActivosFijosListFeature = forwardRef<ActivosFijosListRef>((_, ref) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [isHistorialOpen, setIsHistorialOpen] = useState(false);
    const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false);
    const [isBajaOpen, setIsBajaOpen] = useState(false);

    const handleOpenHistorial = (asset: any) => {
        setSelectedAsset(asset);
        setIsHistorialOpen(true);
    };

    const handleOpenMantenimiento = (asset: any) => {
        setSelectedAsset(asset);
        setIsMantenimientoOpen(true);
    };

    const handleOpenBaja = (asset: any) => {
        setSelectedAsset(asset);
        setIsBajaOpen(true);
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
        { name: "ACTIVO", uid: "nombre" },
        { name: "ESTADO", uid: "estado" },
        { name: "VALOR LIBROS", uid: "valor" },
        { name: "VIDA ÚTIL", uid: "vida_util" },
        { name: "USO", uid: "uso" },
        { name: "ACCIONES", uid: "acciones" },
    ];

    if (isLoading) return <div>Cargando activos...</div>;

    return (
        <div className="space-y-4">
            <Table aria-label="Tabla de Activos Fijos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={
                                column.uid === "acciones" || column.uid === "estado" ? "center" :
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
                                    <User
                                        name={activo.nombre}
                                        description={activo.categoria?.nombre || "Sin categoría"}
                                        avatarProps={{
                                            radius: "lg",
                                            src: activo.fotoUrl
                                        }}
                                    />
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
                                        <Tooltip content="Mantenimiento">
                                            <span
                                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                                onClick={() => handleOpenMantenimiento(activo)}
                                            >
                                                <Wrench className="w-4 h-4" />
                                            </span>
                                        </Tooltip>
                                        <Tooltip content="Ver historial">
                                            <span
                                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                                onClick={() => handleOpenHistorial(activo)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </span>
                                        </Tooltip>
                                        <Tooltip color="danger" content="Dar de baja">
                                            <span
                                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                                onClick={() => handleOpenBaja(activo)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </span>
                                        </Tooltip>
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
