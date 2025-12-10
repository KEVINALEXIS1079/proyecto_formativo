import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CoherenceDifference {
    insumo: string;
    diferenciaQuantidad: number;
    diferenciaCosto: number;
    actividades: string[];
}

interface CoherenceValidationWidgetProps {
    differences: CoherenceDifference[];
    cultivoNombre?: string;
}

export function CoherenceValidationWidget({ differences, cultivoNombre }: CoherenceValidationWidgetProps) {
    const hasErrors = differences && differences.length > 0;

    return (
        <Card>
            <CardHeader className="flex gap-2">
                {hasErrors ? (
                    <>
                        <AlertTriangle className="h-5 w-5 text-warning-600" />
                        <h3 className="text-lg font-semibold">Validación de Coherencia</h3>
                        <Chip color="warning" size="sm">{differences.length} diferencias</Chip>
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-5 w-5 text-success-600" />
                        <h3 className="text-lg font-semibold">Validación de Coherencia</h3>
                        <Chip color="success" size="sm">Sin diferencias</Chip>
                    </>
                )}
            </CardHeader>
            <CardBody>
                {cultivoNombre && (
                    <p className="text-sm text-gray-600 mb-4">
                        Cultivo: <span className="font-semibold">{cultivoNombre}</span>
                    </p>
                )}

                {!hasErrors ? (
                    <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                        <p className="text-success-700 dark:text-success-400">
                            ✓ Los registros de inventario y actividades están sincronizados correctamente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg mb-4">
                            <p className="text-sm text-warning-700 dark:text-warning-400">
                                Se encontraron diferencias entre los consumos registrados en actividades y los movimientos de inventario.
                            </p>
                        </div>

                        {differences.map((diff, index) => (
                            <div
                                key={index}
                                className="border border-warning-200 dark:border-warning-800 rounded-lg p-4 bg-white dark:bg-gray-800"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {diff.insumo}
                                    </h4>
                                    <Chip color="warning" size="sm" variant="flat">
                                        Diferencia
                                    </Chip>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Cantidad</p>
                                        <p className={`font-semibold ${diff.diferenciaQuantidad !== 0 ? 'text-warning-600' : 'text-gray-900'}`}>
                                            {diff.diferenciaQuantidad > 0 ? '+' : ''}{diff.diferenciaQuantidad.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Costo</p>
                                        <p className={`font-semibold ${diff.diferenciaCosto !== 0 ? 'text-warning-600' : 'text-gray-900'}`}>
                                            ${diff.diferenciaCosto.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {diff.actividades && diff.actividades.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Actividades relacionadas:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {diff.actividades.map((act, i) => (
                                                <Chip key={i} size="sm" variant="flat">
                                                    {act}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
