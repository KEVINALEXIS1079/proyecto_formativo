import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider } from '@heroui/react';
import type { ReporteCompleto } from '../../model/types';

interface DetailedReportPreviewProps {
    data: ReporteCompleto;
    selectedSections: string[];
    cultivoNombre?: string;
}

export function DetailedReportPreview({ data, selectedSections, cultivoNombre }: DetailedReportPreviewProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            {selectedSections.includes('resumen') && (
                <Card>
                    <CardHeader className="bg-success-50">
                        <h3 className="font-bold text-lg">Resumen Ejecutivo</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Costos Totales</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.resumen.costoTotal)}</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.ingresoTotal)}</p>
                            </div>
                            <div className="text-center p-4 bg-success-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Utilidad Neta</p>
                                <p className="text-2xl font-bold text-success-600">{formatCurrency(data.resumen.utilidadNeta)}</p>
                            </div>
                        </div>
                        <Divider className="my-4" />
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Relación B/C</p>
                                <p className="text-xl font-bold text-primary-600">{data.resumen.relacionBC.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ROI</p>
                                <p className="text-xl font-bold text-warning-600">{data.resumen.roi.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Margen Neto</p>
                                <p className="text-xl font-bold text-success-600">{data.resumen.margenNeto.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Desglose de Costos */}
            {selectedSections.includes('costos') && (
                <Card>
                    <CardHeader className="bg-red-50">
                        <h3 className="font-bold text-lg">Desglose de Costos</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Costos" removeWrapper>
                            <TableHeader>
                                <TableColumn>CATEGORÍA</TableColumn>
                                <TableColumn>MONTO</TableColumn>
                                <TableColumn>% DEL TOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">Insumos</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(data.costos.insumos)}</TableCell>
                                    <TableCell>{((data.costos.insumos / data.resumen.costoTotal) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Mano de Obra</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(data.costos.manoObra)}</TableCell>
                                    <TableCell>{((data.costos.manoObra / data.resumen.costoTotal) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Maquinaria</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(data.costos.maquinaria)}</TableCell>
                                    <TableCell>{((data.costos.maquinaria / data.resumen.costoTotal) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Otros</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(data.costos.otros)}</TableCell>
                                    <TableCell>{((data.costos.otros / data.resumen.costoTotal) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                                <TableRow className="bg-gray-100">
                                    <TableCell className="font-bold text-lg">TOTAL</TableCell>
                                    <TableCell className="font-bold text-lg text-red-600">{formatCurrency(data.resumen.costoTotal)}</TableCell>
                                    <TableCell className="font-bold">100%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Actividades */}
            {selectedSections.includes('actividades') && (
                <Card>
                    <CardHeader className="bg-primary-50">
                        <h3 className="font-bold text-lg">Actividades Realizadas ({data.actividades.length})</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Actividades" removeWrapper>
                            <TableHeader>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>ACTIVIDAD</TableColumn>
                                <TableColumn>TIPO</TableColumn>
                                <TableColumn>RESPONSABLE</TableColumn>
                                <TableColumn>HORAS</TableColumn>
                                <TableColumn>COSTO</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {data.actividades.map((act) => (
                                    <TableRow key={act.id}>
                                        <TableCell>{new Date(act.fecha).toLocaleDateString('es-CO')}</TableCell>
                                        <TableCell className="font-semibold">{act.nombre}</TableCell>
                                        <TableCell>{act.tipo}</TableCell>
                                        <TableCell>{act.responsable}</TableCell>
                                        <TableCell>{act.horasTrabajadas}h</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(act.costoManoObra)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Insumos */}
            {selectedSections.includes('insumos') && (
                <Card>
                    <CardHeader className="bg-warning-50">
                        <h3 className="font-bold text-lg">Insumos Utilizados ({data.insumos.length})</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Insumos" removeWrapper>
                            <TableHeader>
                                <TableColumn>INSUMO</TableColumn>
                                <TableColumn>CATEGORÍA</TableColumn>
                                <TableColumn>CANTIDAD</TableColumn>
                                <TableColumn>PRECIO UNIT.</TableColumn>
                                <TableColumn>TOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {data.insumos.map((ins) => (
                                    <TableRow key={ins.id}>
                                        <TableCell className="font-semibold">{ins.nombre}</TableCell>
                                        <TableCell>{ins.categoria}</TableCell>
                                        <TableCell>{ins.cantidad} {ins.unidad}</TableCell>
                                        <TableCell>{formatCurrency(ins.precioUnitario)}</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(ins.total)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-gray-100">
                                    <TableCell colSpan={4} className="font-bold">TOTAL INSUMOS</TableCell>
                                    <TableCell className="font-bold text-lg text-warning-600">
                                        {formatCurrency(data.insumos.reduce((sum, i) => sum + i.total, 0))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Ventas */}
            {selectedSections.includes('ventas') && (
                <Card>
                    <CardHeader className="bg-green-50">
                        <h3 className="font-bold text-lg">Ventas Realizadas ({data.ventas.length})</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Ventas" removeWrapper>
                            <TableHeader>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>CLIENTE</TableColumn>
                                <TableColumn>CANTIDAD</TableColumn>
                                <TableColumn>PRECIO UNIT.</TableColumn>
                                <TableColumn>TOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {data.ventas.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>{new Date(v.fecha).toLocaleDateString('es-CO')}</TableCell>
                                        <TableCell className="font-semibold">{v.producto}</TableCell>
                                        <TableCell>{v.cliente}</TableCell>
                                        <TableCell>{v.cantidad} kg</TableCell>
                                        <TableCell>{formatCurrency(v.precioUnitario)}</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(v.total)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-gray-100">
                                    <TableCell colSpan={5} className="font-bold">TOTAL VENTAS</TableCell>
                                    <TableCell className="font-bold text-lg text-green-600">
                                        {formatCurrency(data.ventas.reduce((sum, v) => sum + v.total, 0))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Rentabilidad */}
            {selectedSections.includes('rentabilidad') && (
                <Card>
                    <CardHeader className="bg-success-50">
                        <h3 className="font-bold text-lg">Análisis de Rentabilidad</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Relación Beneficio/Costo</p>
                                    <p className="text-3xl font-bold text-blue-600">{data.resumen.relacionBC.toFixed(3)}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Por cada $1 invertido se obtienen ${data.resumen.relacionBC.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Retorno de Inversión (ROI)</p>
                                    <p className="text-3xl font-bold text-purple-600">{data.resumen.roi.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Rentabilidad sobre la inversión total
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Margen de Utilidad Neto</p>
                                <p className="text-3xl font-bold text-amber-600">{data.resumen.margenNeto.toFixed(2)}%</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Porcentaje de ganancia sobre ventas totales
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
