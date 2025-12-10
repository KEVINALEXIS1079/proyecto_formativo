import type { ReporteCompleto } from '../../model/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FormatPreviewProps {
    data: ReporteCompleto;
    selectedSections: string[];
    cultivoNombre?: string;
    format: 'pdf' | 'excel' | 'csv';
    iotData?: any;
}

export function FormatPreview(props: FormatPreviewProps) {
    const { data, selectedSections, cultivoNombre, format } = props;
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (format === 'pdf') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                <div className="text-center border-b-2 border-success-600 pb-4">
                    <img src="/LogoTic.png" alt="TIC Yamboro" className="h-12 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold">Reporte Completo de Cultivo</h2>
                    <p className="text-lg text-gray-600">{cultivoNombre}</p>
                    <p className="text-sm text-gray-500">Generado: {new Date().toLocaleDateString('es-CO')}</p>
                </div>

                {selectedSections.includes('resumen') && (
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Resumen Ejecutivo</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-gray-600 mb-1">Costos Totales</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.resumen.costoTotal)}</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.ingresoTotal)}</p>
                            </div>
                            <div className="text-center p-4 bg-success-50 rounded-lg border border-success-200">
                                <p className="text-sm text-gray-600 mb-1">Utilidad Neta</p>
                                <p className="text-2xl font-bold text-success-600">{formatCurrency(data.resumen.utilidadNeta)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSections.includes('costos') && (
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Desglose de Costos</h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-3 text-left">Categoría</th>
                                    <th className="border border-gray-300 p-3 text-right">Monto</th>
                                    <th className="border border-gray-300 p-3 text-right">% del Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-3">Insumos</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">{formatCurrency(data.costos.insumos)}</td>
                                    <td className="border border-gray-300 p-3 text-right">{((data.costos.insumos / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-3">Mano de Obra</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">{formatCurrency(data.costos.manoObra)}</td>
                                    <td className="border border-gray-300 p-3 text-right">{((data.costos.manoObra / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-3">Maquinaria</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">{formatCurrency(data.costos.maquinaria)}</td>
                                    <td className="border border-gray-300 p-3 text-right">{((data.costos.maquinaria / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-3">Otros</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">{formatCurrency(data.costos.otros)}</td>
                                    <td className="border border-gray-300 p-3 text-right">{((data.costos.otros / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                </tr>
                                <tr className="bg-gray-100 font-bold">
                                    <td className="border border-gray-300 p-3">TOTAL</td>
                                    <td className="border border-gray-300 p-3 text-right text-red-600">{formatCurrency(data.resumen.costoTotal)}</td>
                                    <td className="border border-gray-300 p-3 text-right">100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedSections.includes('rentabilidad') && (
                    <div className="mb-10">
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Indicadores de Rentabilidad</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-600 mb-1">Relación B/C</p>
                                <p className="text-3xl font-bold text-blue-600">{data.resumen.relacionBC.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-2">Por cada $1 invertido se obtienen ${data.resumen.relacionBC.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-600 mb-1">ROI</p>
                                <p className="text-3xl font-bold text-purple-600">{data.resumen.roi.toFixed(2)}%</p>
                                <p className="text-xs text-gray-500 mt-2">Retorno sobre inversión</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-sm text-gray-600 mb-1">Margen Neto</p>
                                <p className="text-3xl font-bold text-amber-600">{data.resumen.margenNeto.toFixed(2)}%</p>
                                <p className="text-xs text-gray-500 mt-2">Utilidad sobre ventas</p>
                            </div>
                        </div>
                    </div>
                )}
                {selectedSections.includes('rentabilidad') && (selectedSections.length > 3) && <hr className="border-gray-200" />}

                {selectedSections.includes('actividades') && (
                    <div className="mb-10">
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Actividades Realizadas ({data.actividades.length})</h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                    <th className="border border-gray-300 p-2 text-left">Actividad</th>
                                    <th className="border border-gray-300 p-2 text-left">Tipo</th>
                                    <th className="border border-gray-300 p-2 text-left">Responsable</th>
                                    <th className="border border-gray-300 p-2 text-right">Horas</th>
                                    <th className="border border-gray-300 p-2 text-right">Costo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.actividades.map((act) => (
                                    <tr key={act.id}>
                                        <td className="border border-gray-300 p-2">{new Date(act.fecha).toLocaleDateString('es-CO')}</td>
                                        <td className="border border-gray-300 p-2 font-semibold">{act.nombre}</td>
                                        <td className="border border-gray-300 p-2">{act.tipo}</td>
                                        <td className="border border-gray-300 p-2">{act.responsable}</td>
                                        <td className="border border-gray-300 p-2 text-right">{act.horasTrabajadas}h</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(act.costoManoObra)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedSections.includes('insumos') && (
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Insumos Utilizados ({data.insumos.length})</h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Insumo</th>
                                    <th className="border border-gray-300 p-2 text-left">Categoría</th>
                                    <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                    <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                                    <th className="border border-gray-300 p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.insumos.map((ins) => (
                                    <tr key={ins.id}>
                                        <td className="border border-gray-300 p-2 font-semibold">{ins.nombre}</td>
                                        <td className="border border-gray-300 p-2">{ins.categoria}</td>
                                        <td className="border border-gray-300 p-2 text-right">{ins.cantidad} {ins.unidad}</td>
                                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(ins.precioUnitario)}</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(ins.total)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={4} className="border border-gray-300 p-2">TOTAL INSUMOS</td>
                                    <td className="border border-gray-300 p-2 text-right text-warning-600">
                                        {formatCurrency(data.insumos.reduce((sum, i) => sum + i.total, 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedSections.includes('ventas') && (
                    <div className="mb-10">
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Ventas Realizadas ({data.ventas.length})</h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                    <th className="border border-gray-300 p-2 text-left">Producto</th>
                                    <th className="border border-gray-300 p-2 text-left">Cliente</th>
                                    <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                    <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                                    <th className="border border-gray-300 p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.ventas.map((v) => (
                                    <tr key={v.id}>
                                        <td className="border border-gray-300 p-2">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                                        <td className="border border-gray-300 p-2 font-semibold">{v.producto}</td>
                                        <td className="border border-gray-300 p-2">{v.cliente}</td>
                                        <td className="border border-gray-300 p-2 text-right">{v.cantidad} kg</td>
                                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(v.precioUnitario)}</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(v.total)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={5} className="border border-gray-300 p-2">TOTAL VENTAS</td>
                                    <td className="border border-gray-300 p-2 text-right text-green-600">
                                        {formatCurrency(data.ventas.reduce((sum, v) => sum + v.total, 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Cosechas Section */}
                {selectedSections.includes('cosechas') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Lotes de Producción - Cosechas ({data.cosechas?.length || 0})</h3>
                        {data.cosechas && data.cosechas.length > 0 ? (
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                        <th className="border border-gray-300 p-2 text-left">Producto</th>
                                        <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                        <th className="border border-gray-300 p-2 text-left">Calidad</th>
                                        <th className="border border-gray-300 p-2 text-right">Costo Unit.</th>
                                        <th className="border border-gray-300 p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.cosechas.map((c) => (
                                        <tr key={c.id}>
                                            <td className="border border-gray-300 p-2">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                                            <td className="border border-gray-300 p-2 font-semibold">{c.producto}</td>
                                            <td className="border border-gray-300 p-2 text-right">{c.cantidad} kg</td>
                                            <td className="border border-gray-300 p-2">{c.calidad}</td>
                                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.costoUnitario)}</td>
                                            <td className="border border-gray-300 p-2 text-right font-bold">{formatCurrency(c.costoTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 italic">No hay cosechas registradas.</p>
                        )}
                    </div>
                )}

                {selectedSections.includes('cosechas') && selectedSections.includes('monitoreo') && <hr className="border-gray-200" />}

                {/* Monitoreo IoT Section */}
                {selectedSections.includes('monitoreo') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-xl mb-4 text-success-600 border-b pb-2">Monitoreo IoT</h3>
                        {(props as any).iotData ? (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-gray-50 rounded border">
                                        <p className="text-xs text-gray-500">Total Sensores</p>
                                        <p className="font-bold">{(props as any).iotData.totalSensors}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded border border-green-200">
                                        <p className="text-xs text-green-700">Conectados</p>
                                        <p className="font-bold text-green-700">{(props as any).iotData.estados.conectados}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded border border-red-200">
                                        <p className="text-xs text-red-700">Alertas Activas</p>
                                        <p className="font-bold text-red-700">{(props as any).iotData.alertasActivas}</p>
                                    </div>
                                </div>

                                {/* Trend Chart */}
                                {(props as any).iotData.chartData && (props as any).iotData.chartData.length > 0 && (
                                    <div className="h-64 w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Tendencia de Sensores (Últimas 24h)</h4>
                                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                            <LineChart
                                                data={(props as any).iotData.chartData}
                                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="fecha"
                                                    tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    style={{ fontSize: '10px' }}
                                                />
                                                <YAxis style={{ fontSize: '10px' }} domain={['auto', 'auto']} />
                                                <Tooltip
                                                    labelFormatter={(label) => new Date(label).toLocaleString()}
                                                    formatter={(value: number) => [value.toFixed(2), 'Valor']}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Lectura" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Averages Table */}
                                {(props as any).iotData.promedios && (props as any).iotData.promedios.length > 0 && (
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 p-2 text-left">Sensor</th>
                                                <th className="border border-gray-300 p-2 text-right">Promedio</th>
                                                <th className="border border-gray-300 p-2 text-right">Min</th>
                                                <th className="border border-gray-300 p-2 text-right">Max</th>
                                                <th className="border border-gray-300 p-2 text-left">Unidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(props as any).iotData.promedios.map((p: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-300 p-2 font-semibold">{p.label}</td>
                                                    <td className="border border-gray-300 p-2 text-right">{p.value}</td>
                                                    <td className="border border-gray-300 p-2 text-right">{(props as any).iotData.minGlobal}</td>
                                                    <td className="border border-gray-300 p-2 text-right">{(props as any).iotData.maxGlobal}</td>
                                                    <td className="border border-gray-300 p-2">{p.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
                                <p className="font-semibold">Sin datos de monitoreo disponibles.</p>
                                <p className="text-sm">Verifique que el cultivo tenga un lote asignado y existan sensores registrados.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (format === 'excel') {
        return (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden space-y-4">
                {/* Header */}
                <div className="bg-green-600 text-white p-3 flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12.9,14.5L15.8,19H14L12,15.6L10,19H8.2L11.1,14.5L8.2,10H10L12,13.4L14,10H15.8L12.9,14.5Z" />
                    </svg>
                    <span className="font-semibold">Excel: Reporte Completo - {cultivoNombre}</span>
                </div>

                <div className="p-4 space-y-6 max-h-[600px] overflow-auto">
                    {/* Información General */}
                    <div>
                        <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">INFORMACIÓN GENERAL</h4>
                        <table className="w-full border-collapse text-sm">
                            <tbody>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-2 font-semibold">Cultivo</td>
                                    <td className="border border-gray-300 p-2">{cultivoNombre}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-semibold">Fecha de Generación</td>
                                    <td className="border border-gray-300 p-2">{new Date().toLocaleDateString('es-CO')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen Financiero */}
                    {selectedSections.includes('resumen') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">RESUMEN FINANCIERO</h4>
                            <table className="w-full border-collapse text-sm">
                                <tbody>
                                    <tr className="bg-red-50">
                                        <td className="border border-gray-300 p-2 font-semibold">Costos Totales</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold text-red-600">{formatCurrency(data.resumen.costoTotal)}</td>
                                    </tr>
                                    <tr className="bg-green-50">
                                        <td className="border border-gray-300 p-2 font-semibold">Ingresos Totales</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold text-green-600">{formatCurrency(data.resumen.ingresoTotal)}</td>
                                    </tr>
                                    <tr className="bg-success-50">
                                        <td className="border border-gray-300 p-2 font-semibold">Utilidad Neta</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold text-success-600">{formatCurrency(data.resumen.utilidadNeta)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Indicadores de Rentabilidad */}
                    {selectedSections.includes('rentabilidad') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">INDICADORES DE RENTABILIDAD</h4>
                            <table className="w-full border-collapse text-sm">
                                <tbody>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2 font-semibold">Relación B/C</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{data.resumen.relacionBC.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-semibold">ROI (%)</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{data.resumen.roi.toFixed(2)}%</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2 font-semibold">Margen Neto (%)</td>
                                        <td className="border border-gray-300 p-2 text-right font-bold">{data.resumen.margenNeto.toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Desglose de Costos */}
                    {selectedSections.includes('costos') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">DESGLOSE DE COSTOS</h4>
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Categoría</th>
                                        <th className="border border-gray-300 p-2 text-right">Monto</th>
                                        <th className="border border-gray-300 p-2 text-right">% del Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 p-2">Insumos</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(data.costos.insumos)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{((data.costos.insumos / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2">Mano de Obra</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(data.costos.manoObra)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{((data.costos.manoObra / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">Maquinaria</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(data.costos.maquinaria)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{((data.costos.maquinaria / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 p-2">Otros</td>
                                        <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(data.costos.otros)}</td>
                                        <td className="border border-gray-300 p-2 text-right">{((data.costos.otros / data.resumen.costoTotal) * 100).toFixed(1)}%</td>
                                    </tr>
                                    <tr className="bg-gray-200 font-bold">
                                        <td className="border border-gray-300 p-2">TOTAL</td>
                                        <td className="border border-gray-300 p-2 text-right text-red-600">{formatCurrency(data.resumen.costoTotal)}</td>
                                        <td className="border border-gray-300 p-2 text-right">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Actividades */}
                    {selectedSections.includes('actividades') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">ACTIVIDADES REALIZADAS ({data.actividades.length})</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                            <th className="border border-gray-300 p-2 text-left">Actividad</th>
                                            <th className="border border-gray-300 p-2 text-left">Tipo</th>
                                            <th className="border border-gray-300 p-2 text-left">Responsable</th>
                                            <th className="border border-gray-300 p-2 text-right">Horas</th>
                                            <th className="border border-gray-300 p-2 text-right">Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.actividades.slice(0, 5).map((act, idx) => (
                                            <tr key={act.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="border border-gray-300 p-2">{new Date(act.fecha).toLocaleDateString('es-CO')}</td>
                                                <td className="border border-gray-300 p-2 font-semibold">{act.nombre}</td>
                                                <td className="border border-gray-300 p-2">{act.tipo}</td>
                                                <td className="border border-gray-300 p-2">{act.responsable}</td>
                                                <td className="border border-gray-300 p-2 text-right">{act.horasTrabajadas}h</td>
                                                <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(act.costoManoObra)}</td>
                                            </tr>
                                        ))}
                                        {data.actividades.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={6} className="border border-gray-300 p-2 text-center text-gray-600 italic">
                                                    ... y {data.actividades.length - 5} actividades más (ver archivo exportado)
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Insumos */}
                    {selectedSections.includes('insumos') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">INSUMOS UTILIZADOS ({data.insumos.length})</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left">Insumo</th>
                                            <th className="border border-gray-300 p-2 text-left">Categoría</th>
                                            <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                            <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                                            <th className="border border-gray-300 p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.insumos.slice(0, 5).map((ins, idx) => (
                                            <tr key={ins.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="border border-gray-300 p-2 font-semibold">{ins.nombre}</td>
                                                <td className="border border-gray-300 p-2">{ins.categoria}</td>
                                                <td className="border border-gray-300 p-2 text-right">{ins.cantidad} {ins.unidad}</td>
                                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(ins.precioUnitario)}</td>
                                                <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(ins.total)}</td>
                                            </tr>
                                        ))}
                                        {data.insumos.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={5} className="border border-gray-300 p-2 text-center text-gray-600 italic">
                                                    ... y {data.insumos.length - 5} insumos más (ver archivo exportado)
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-200 font-bold">
                                            <td colSpan={4} className="border border-gray-300 p-2">TOTAL INSUMOS</td>
                                            <td className="border border-gray-300 p-2 text-right text-warning-600">
                                                {formatCurrency(data.insumos.reduce((sum, i) => sum + i.total, 0))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Ventas */}
                    {selectedSections.includes('ventas') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">VENTAS REALIZADAS ({data.ventas.length})</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                            <th className="border border-gray-300 p-2 text-left">Producto</th>
                                            <th className="border border-gray-300 p-2 text-left">Cliente</th>
                                            <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                            <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                                            <th className="border border-gray-300 p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.ventas.slice(0, 5).map((v, idx) => (
                                            <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="border border-gray-300 p-2">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                                                <td className="border border-gray-300 p-2 font-semibold">{v.producto}</td>
                                                <td className="border border-gray-300 p-2">{v.cliente}</td>
                                                <td className="border border-gray-300 p-2 text-right">{v.cantidad} kg</td>
                                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(v.precioUnitario)}</td>
                                                <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(v.total)}</td>
                                            </tr>
                                        ))}
                                        {data.ventas.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={6} className="border border-gray-300 p-2 text-center text-gray-600 italic">
                                                    ... y {data.ventas.length - 5} ventas más (ver archivo exportado)
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-200 font-bold">
                                            <td colSpan={5} className="border border-gray-300 p-2">TOTAL VENTAS</td>
                                            <td className="border border-gray-300 p-2 text-right text-green-600">
                                                {formatCurrency(data.ventas.reduce((sum, v) => sum + v.total, 0))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cosechas (Excel) */}
                    {selectedSections.includes('cosechas') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">COSECHAS ({data.cosechas?.length || 0})</h4>
                            {data.cosechas && data.cosechas.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 p-2 text-left">Fecha</th>
                                                <th className="border border-gray-300 p-2 text-left">Producto</th>
                                                <th className="border border-gray-300 p-2 text-right">Cantidad</th>
                                                <th className="border border-gray-300 p-2 text-left">Calidad</th>
                                                <th className="border border-gray-300 p-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.cosechas.slice(0, 5).map((c, idx) => (
                                                <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="border border-gray-300 p-2">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                                                    <td className="border border-gray-300 p-2">{c.producto}</td>
                                                    <td className="border border-gray-300 p-2 text-right">{c.cantidad} kg</td>
                                                    <td className="border border-gray-300 p-2">{c.calidad}</td>
                                                    <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.costoTotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm">No hay cosechas registradas.</p>
                            )}
                        </div>
                    )}

                    {/* Monitoreo IoT (Excel - Summary) */}
                    {selectedSections.includes('monitoreo') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">MONITOREO IOT</h4>
                            {(props as any).iotData ? (
                                <table className="w-full border-collapse text-sm">
                                    <tbody>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 p-2 font-semibold">Total Sensores</td>
                                            <td className="border border-gray-300 p-2 text-right">{(props as any).iotData.totalSensors}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 p-2 font-semibold">Alertas Activas</td>
                                            <td className="border border-gray-300 p-2 text-right text-red-600 font-bold">{(props as any).iotData.alertasActivas}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 italic text-sm">Sin datos IoT.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // CSV format
    return (
        <div className="bg-gray-900 text-green-400 rounded-lg shadow-lg p-4 font-mono text-xs overflow-auto" style={{ maxHeight: '600px' }}>
            <div className="mb-2">
                <span className="text-gray-500"># Reporte de Cultivo: {cultivoNombre}</span>
            </div>
            <div className="mb-2">
                <span className="text-gray-500"># Generado: {new Date().toLocaleDateString('es-CO')}</span>
            </div>
            <div className="mb-4">
                <span className="text-gray-500"># Secciones: {selectedSections.length}</span>
            </div>

            {selectedSections.includes('resumen') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,RESUMEN_FINANCIERO</div>
                    <div>Concepto,Valor</div>
                    <div>Costos Totales,{data.resumen.costoTotal}</div>
                    <div>Ingresos Totales,{data.resumen.ingresoTotal}</div>
                    <div>Utilidad Neta,{data.resumen.utilidadNeta}</div>
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('rentabilidad') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,INDICADORES</div>
                    <div>Indicador,Valor</div>
                    <div>Relacion B/C,{data.resumen.relacionBC.toFixed(2)}</div>
                    <div>ROI,{data.resumen.roi.toFixed(2)}</div>
                    <div>Margen Neto,{data.resumen.margenNeto.toFixed(2)}</div>
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('costos') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,COSTOS</div>
                    <div>Categoria,Monto</div>
                    <div>Insumos,{data.costos.insumos}</div>
                    <div>Mano de Obra,{data.costos.manoObra}</div>
                    <div>Maquinaria,{data.costos.maquinaria}</div>
                    <div>Otros,{data.costos.otros}</div>
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('actividades') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,ACTIVIDADES</div>
                    <div>Fecha,Actividad,Tipo,Responsable,Horas,Costo</div>
                    {data.actividades.map((act) => (
                        <div key={act.id}>{act.fecha},{act.nombre},{act.tipo},{act.responsable},{act.horasTrabajadas},{act.costoManoObra}</div>
                    ))}
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('cosechas') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,COSECHAS</div>
                    <div>Fecha,Producto,Cantidad,Total</div>
                    {data.cosechas?.map((c) => (
                        <div key={c.id}>{new Date(c.fecha).toLocaleDateString()},{c.producto},{c.cantidad},{c.costoTotal}</div>
                    ))}
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('monitoreo') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,MONITOREO_IOT</div>
                    {(props as any).iotData ? (
                        <>
                            <div>Total Sensores,{(props as any).iotData.totalSensors}</div>
                            <div>Alertas,{(props as any).iotData.alertasActivas}</div>
                        </>
                    ) : (
                        <div>Sin datos monitoreo</div>
                    )}
                    <div className="mb-3"></div>
                </>
            )}
        </div>
    );
}
