import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Button, Badge, Spinner, Chip } from "@heroui/react";
import { Bell, AlertTriangle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStockAlerts } from "../api/insumos.service";

export const StockAlertBell = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ["stock-alerts"],
        queryFn: getStockAlerts,
        refetchInterval: 60000, // Check every minute
    });

    const count = alerts.length;

    const handleItemAction = () => {
        // Navigate or show details. For now, we can just close.
        // If we had a direct link to insumo details, we could navigate.
        setIsOpen(false);
    };

    return (
        <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <div className="cursor-pointer">
                    <Badge
                        content={count > 0 ? count : null}
                        color="danger"
                        shape="circle"
                        isInvisible={count === 0}
                    >
                        <Button
                            isIconOnly
                            variant="light"
                            aria-label="Notificaciones de stock"
                            className={count > 0 ? "text-danger" : "text-default-500"}
                        >
                            <Bell size={24} />
                        </Button>
                    </Badge>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0">
                <div className="p-3 border-b border-default-200 flex justify-between items-center bg-gray-50">
                    <span className="font-semibold text-small">Alertas de Stock</span>
                    {count > 0 && <Chip size="sm" color="danger" variant="flat">{count} nuevas</Chip>}
                </div>

                <div className="max-h-[300px] overflow-y-auto w-full py-2">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Spinner size="sm" color="danger" />
                        </div>
                    ) : count === 0 ? (
                        <div className="p-4 text-center text-default-400 text-sm">
                            <div className="flex justify-center mb-2">
                                <Bell className="text-default-300" size={32} />
                            </div>
                            No hay alertas de stock pendientes.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 px-2">
                            {alerts.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-default-100 cursor-pointer transition-colors"
                                    onClick={() => handleItemAction()}
                                >
                                    <div className="mt-1">
                                        {item.estado === 'AGOTADO' ? (
                                            <AlertCircle className="text-danger" size={18} />
                                        ) : (
                                            <AlertTriangle className="text-warning" size={18} />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium text-gray-800">{item.nombre}</span>
                                        <span className="text-xs text-default-500">
                                            Stock: <b className={item.stockUso === 0 ? "text-danger" : "text-warning"}>{item.stockUso} {item.unidadUso}</b>
                                            {" "}(Mín: {item.stockMinimo})
                                        </span>
                                        <span className="text-[10px] text-default-400 uppercase mt-1">
                                            {item.almacen?.nombre || 'Sin almacén'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
