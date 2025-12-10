import { Card, CardBody, CardHeader } from '@heroui/react';
import { TrendingUp } from 'lucide-react';

interface TopInsumo {
    nombre: string;
    cantidad: number;
    costo: number;
    unidad: string;
}

interface TopInsumosWidgetProps {
    insumos: TopInsumo[];
    orderBy?: 'cantidad' | 'costo';
    limit?: number;
}

export function TopInsumosWidget({ insumos, orderBy = 'costo', limit = 10 }: TopInsumosWidgetProps) {
    const sortedInsumos = [...insumos]
        .sort((a, b) => orderBy === 'costo' ? b.costo - a.costo : b.cantidad - a.cantidad)
        .slice(0, limit);

    if (sortedInsumos.length === 0) {
        return (
            <Card>
                <CardBody>
                    <p className="text-gray-500">No hay datos de insumos disponibles</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex gap-2">
                <TrendingUp className="h-5 w-5 text-success-600" />
                <h3 className="text-lg font-semibold">
                    Top {limit} Insumos por {orderBy === 'costo' ? 'Costo' : 'Cantidad'}
                </h3>
            </CardHeader>
            <CardBody>
                <div className="space-y-3">
                    {sortedInsumos.map((insumo, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-success-100 dark:bg-success-900/20 text-success-600 rounded-full font-semibold text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium">{insumo.nombre}</p>
                                    <p className="text-sm text-gray-500">
                                        {insumo.cantidad.toFixed(2)} {insumo.unidad}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-success-600">
                                    ${insumo.costo.toLocaleString()}
                                </p>
                                {orderBy === 'costo' && (
                                    <p className="text-xs text-gray-500">
                                        ${(insumo.costo / insumo.cantidad).toFixed(2)}/{insumo.unidad}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
