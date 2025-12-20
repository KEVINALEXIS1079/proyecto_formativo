import React, { useState, useMemo } from 'react';
import type { ReporteCompleto } from '../../model/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Chip,
    Pagination
} from "@heroui/react";
import { ChevronDown, Eye, Settings, FileSpreadsheet, FileText, LayoutList } from "lucide-react";

interface FormatPreviewProps {
    data: ReporteCompleto;
    selectedSections: string[];
    cultivoNombre?: string;
    format: 'pdf' | 'excel' | 'csv';
    iotData?: any;
}

// Column Definitions
const COLUMNS_ACTIVIDADES = [
    { uid: "fecha", name: "Fecha" },
    { uid: "nombre", name: "Actividad" },
    { uid: "tipo", name: "Tipo" },
    { uid: "responsable", name: "Responsable" },
    { uid: "horas", name: "Horas" },
    { uid: "costo", name: "Costo" },
];

const COLUMNS_INSUMOS = [
    { uid: "nombre", name: "Insumo" },
    { uid: "categoria", name: "Categoría" },
    { uid: "cantidad", name: "Cantidad" },
    { uid: "precio", name: "Precio Unit." },
    { uid: "total", name: "Total" },
];

const COLUMNS_VENTAS = [
    { uid: "fecha", name: "Fecha" },
    { uid: "producto", name: "Producto" },
    { uid: "cliente", name: "Cliente" },
    { uid: "cantidad", name: "Cantidad" },
    { uid: "precio", name: "Precio Unit." },
    { uid: "total", name: "Total" },
];

const COLUMNS_COSECHAS = [
    { uid: "fecha", name: "Fecha" },
    { uid: "producto", name: "Producto" },
    { uid: "cantidad", name: "Cantidad" },
    { uid: "calidad", name: "Calidad" },
    { uid: "costoUnit", name: "Costo Unit." },
    { uid: "total", name: "Total" },
];

export function FormatPreview(props: FormatPreviewProps) {
    const { data, selectedSections, cultivoNombre, format } = props;

    // State for Visible Columns
    const [visibleColsActividades, setVisibleColsActividades] = useState<Set<string>>(new Set(COLUMNS_ACTIVIDADES.map(c => c.uid)));
    const [visibleColsInsumos, setVisibleColsInsumos] = useState<Set<string>>(new Set(COLUMNS_INSUMOS.map(c => c.uid)));
    const [visibleColsVentas, setVisibleColsVentas] = useState<Set<string>>(new Set(COLUMNS_VENTAS.map(c => c.uid)));
    const [visibleColsCosechas, setVisibleColsCosechas] = useState<Set<string>>(new Set(COLUMNS_COSECHAS.map(c => c.uid)));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Helper to render Column Toggler
    const renderColumnToggler = (
        title: string,
        allColumns: { uid: string; name: string }[],
        visibleSet: Set<string>,
        setVisibleSet: React.Dispatch<React.SetStateAction<Set<string>>>
    ) => (
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <LayoutList size={20} className="text-gray-500" />
                {title}
            </h3>
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="flat"
                        size="sm"
                        endContent={<ChevronDown size={16} />}
                        className="bg-gray-100 text-gray-700 font-medium"
                    >
                        Columnas
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label={`Columnas ${title}`}
                    closeOnSelect={false}
                    selectedKeys={visibleSet}
                    selectionMode="multiple"
                    onSelectionChange={(keys) => setVisibleSet(new Set(Array.from(keys) as string[]))}
                >
                    {allColumns.map((col) => (
                        <DropdownItem key={col.uid}>{col.name}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );

    if (format === 'pdf') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 font-mono text-sm max-w-3xl mx-auto">
                {/* Header Receipt Style */}
                <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-300">
                    <img src="/logoAgrotech.png" alt="Agrotech" className="h-16 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-4">REPORTE DE CULTIVO</p>

                    <div className="flex flex-col gap-1 text-gray-600">
                        <p><span className="font-bold">CULTIVO:</span> {cultivoNombre?.toUpperCase()}</p>
                        <p><span className="font-bold">FECHA:</span> {new Date().toLocaleString('es-CO')}</p>
                    </div>
                </div>

                {selectedSections.includes('resumen') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-1">Resumen Financiero</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                <span className="text-gray-600">Ingresos Totales</span>
                                <span className="font-bold text-gray-800">{formatCurrency(data.resumen.ingresoTotal)}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-100 py-1">
                                <span className="text-gray-600">Costos Totales</span>
                                <span className="font-bold text-gray-800">{formatCurrency(data.resumen.costoTotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-2 bg-gray-50 px-2 rounded">
                                <span className="font-bold text-gray-800 uppercase">Utilidad Neta</span>
                                <span className={`font-bold text-lg ${data.resumen.utilidadNeta >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {formatCurrency(data.resumen.utilidadNeta)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSections.includes('rentabilidad') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-1">Rentabilidad</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase mb-1">Relación B/C</p>
                                <p className="text-xl font-bold text-blue-600">{data.resumen.relacionBC.toFixed(2)}</p>
                            </div>
                            <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase mb-1">ROI</p>
                                <p className={`text-xl font-bold ${data.resumen.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{data.resumen.roi.toFixed(2)}%</p>
                            </div>
                            <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase mb-1">Margen Neto</p>
                                <p className={`text-xl font-bold ${data.resumen.margenNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}>{data.resumen.margenNeto.toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSections.includes('costos') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-1">Desglose de Costos</h3>
                        <div className="border border-gray-100 rounded">
                            {[
                                { label: 'Insumos', value: data.costos.insumos },
                                { label: 'Mano de Obra', value: data.costos.manoObra },
                                { label: 'Maquinaria', value: data.costos.maquinaria },
                                { label: 'Otros', value: data.costos.otros }
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between py-2 px-3 border-b border-dashed border-gray-100 last:border-0 hover:bg-gray-50">
                                    <span className="text-gray-600">{item.label}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-800 block">{formatCurrency(item.value)}</span>
                                        <span className="text-xs text-gray-400">{((item.value / (data.resumen.costoTotal || 1)) * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between py-2 px-3 bg-gray-50 font-bold border-t border-gray-200">
                                <span>TOTAL COSTOS</span>
                                <span>{formatCurrency(data.resumen.costoTotal)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSections.includes('actividades') && (
                    <div className="mb-8">
                        <div className="mb-3">
                            {renderColumnToggler(
                                `ACTIVIDADES (${data.actividades.length})`,
                                COLUMNS_ACTIVIDADES,
                                visibleColsActividades,
                                setVisibleColsActividades
                            )}
                        </div>
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                                    <tr>
                                        {COLUMNS_ACTIVIDADES.map(col =>
                                            visibleColsActividades.has(col.uid) && (
                                                <th key={col.uid} className="py-2 px-3 text-left">{col.name}</th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed divide-gray-100">
                                    {data.actividades.map((act) => (
                                        <tr key={act.id}>
                                            {visibleColsActividades.has("fecha") && <td className="py-2 px-3 text-gray-500">{new Date(act.fecha).toLocaleDateString('es-CO')}</td>}
                                            {visibleColsActividades.has("nombre") && <td className="py-2 px-3 font-medium text-gray-800">{act.nombre}</td>}
                                            {visibleColsActividades.has("tipo") && <td className="py-2 px-3 text-gray-500">{act.tipo}</td>}
                                            {visibleColsActividades.has("responsable") && <td className="py-2 px-3 text-gray-500">{act.responsable}</td>}
                                            {visibleColsActividades.has("horas") && <td className="py-2 px-3 text-right text-gray-500">{act.horasTrabajadas}h</td>}
                                            {visibleColsActividades.has("costo") && <td className="py-2 px-3 text-right font-medium text-gray-800">{formatCurrency(act.costoManoObra)}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSections.includes('insumos') && (
                    <div className="mb-8">
                        <div className="mb-3">
                            {renderColumnToggler(
                                `INSUMOS (${data.insumos.length})`,
                                COLUMNS_INSUMOS,
                                visibleColsInsumos,
                                setVisibleColsInsumos
                            )}
                        </div>
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                                    <tr>
                                        {COLUMNS_INSUMOS.map(col =>
                                            visibleColsInsumos.has(col.uid) && (
                                                <th key={col.uid} className="py-2 px-3 text-left">{col.name}</th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed divide-gray-100">
                                    {data.insumos.map((ins) => (
                                        <tr key={ins.id}>
                                            {visibleColsInsumos.has("nombre") && <td className="py-2 px-3 font-medium text-gray-800">{ins.nombre}</td>}
                                            {visibleColsInsumos.has("categoria") && <td className="py-2 px-3 text-gray-500">{ins.categoria}</td>}
                                            {visibleColsInsumos.has("cantidad") && <td className="py-2 px-3 text-right text-gray-500">{ins.cantidad} {ins.unidad}</td>}
                                            {visibleColsInsumos.has("precio") && <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(ins.precioUnitario)}</td>}
                                            {visibleColsInsumos.has("total") && <td className="py-2 px-3 text-right font-medium text-gray-800">{formatCurrency(ins.total)}</td>}
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                        <td colSpan={Array.from(visibleColsInsumos).length - 1} className="py-2 px-3 text-right uppercase text-xs">Total Insumos</td>
                                        <td className="py-2 px-3 text-right text-gray-800">
                                            {formatCurrency(data.insumos.reduce((sum, i) => sum + i.total, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSections.includes('ventas') && (
                    <div className="mb-8">
                        <div className="mb-3">
                            {renderColumnToggler(
                                `VENTAS (${data.ventas.length})`,
                                COLUMNS_VENTAS,
                                visibleColsVentas,
                                setVisibleColsVentas
                            )}
                        </div>
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                                    <tr>
                                        {COLUMNS_VENTAS.map(col =>
                                            visibleColsVentas.has(col.uid) && (
                                                <th key={col.uid} className="py-2 px-3 text-left">{col.name}</th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dashed divide-gray-100">
                                    {data.ventas.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50">
                                            {visibleColsVentas.has("fecha") && <td className="py-2 px-3 text-gray-500">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>}
                                            {visibleColsVentas.has("producto") && <td className="py-2 px-3 font-medium text-gray-800">{v.producto}</td>}
                                            {visibleColsVentas.has("cliente") && <td className="py-2 px-3 text-gray-500">{v.cliente}</td>}
                                            {visibleColsVentas.has("cantidad") && <td className="py-2 px-3 text-right text-gray-500">{v.cantidad} kg</td>}
                                            {visibleColsVentas.has("precio") && <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(v.precioUnitario)}</td>}
                                            {visibleColsVentas.has("total") && <td className="py-2 px-3 text-right font-medium text-gray-800">{formatCurrency(v.total)}</td>}
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                        <td colSpan={Array.from(visibleColsVentas).length - 1} className="py-2 px-3 text-right uppercase text-xs">Total Ventas</td>
                                        <td className="py-2 px-3 text-right text-gray-800">
                                            {formatCurrency(data.ventas.reduce((sum, v) => sum + v.total, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSections.includes('cosechas') && (
                    <div className="mb-8">
                        <div className="mb-3">
                            {renderColumnToggler(
                                `COSECHAS (${data.cosechas?.length || 0})`,
                                COLUMNS_COSECHAS,
                                visibleColsCosechas,
                                setVisibleColsCosechas
                            )}
                        </div>
                        {data.cosechas && data.cosechas.length > 0 ? (
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            {COLUMNS_COSECHAS.map(col =>
                                                visibleColsCosechas.has(col.uid) && (
                                                    <th key={col.uid} className="py-2 px-3 text-left">{col.name}</th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dashed divide-gray-100">
                                        {data.cosechas.map((c) => (
                                            <tr key={c.id}>
                                                {visibleColsCosechas.has("fecha") && <td className="py-2 px-3 text-gray-500">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>}
                                                {visibleColsCosechas.has("producto") && <td className="py-2 px-3 font-medium text-gray-800">{c.producto}</td>}
                                                {visibleColsCosechas.has("cantidad") && <td className="py-2 px-3 text-right text-gray-500">{c.cantidad} kg</td>}
                                                {visibleColsCosechas.has("calidad") && <td className="py-2 px-3 text-gray-500">{c.calidad}</td>}
                                                {visibleColsCosechas.has("costoUnit") && <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(c.costoUnitario)}</td>}
                                                {visibleColsCosechas.has("total") && <td className="py-2 px-3 text-right font-medium text-gray-800">{formatCurrency(c.costoTotal)}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-xs italic text-center py-4 bg-gray-50 rounded border border-dashed border-gray-200">No hay cosechas registradas.</p>
                        )}
                    </div>
                )}

                {selectedSections.includes('monitoreo') && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-1">Monitoreo IoT</h3>
                        {(props as any).iotData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                                    <div className="p-2 border border-dashed border-gray-200 rounded">
                                        <p className="text-gray-500 uppercase">Total Sensores</p>
                                        <p className="font-bold text-lg text-gray-800">{(props as any).iotData.totalSensors}</p>
                                    </div>
                                    <div className="p-2 border border-dashed border-gray-200 rounded">
                                        <p className="text-gray-500 uppercase">Conectados</p>
                                        <p className="font-bold text-lg text-green-600">{(props as any).iotData.estados.conectados}</p>
                                    </div>
                                    <div className="p-2 border border-dashed border-gray-200 rounded">
                                        <p className="text-gray-500 uppercase">Alertas</p>
                                        <p className="font-bold text-lg text-red-600">{(props as any).iotData.alertasActivas}</p>
                                    </div>
                                </div>

                                {(props as any).iotData.chartData && (props as any).iotData.chartData.length > 0 && (
                                    <div className="h-48 w-full border border-gray-200 rounded bg-white p-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={(props as any).iotData.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis hide />
                                                <YAxis hide domain={['auto', 'auto']} />
                                                <Tooltip
                                                    contentStyle={{ fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
                                                    labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                />
                                                <Line type="monotone" dataKey="valor" stroke="#000" strokeWidth={1.5} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <p className="text-center text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Tendencia 24h</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-xs italic text-center py-4 bg-gray-50 rounded border border-dashed border-gray-200">Sin datos de monitoreo.</p>
                        )}
                    </div>
                )}

                <div className="text-center pt-6 border-t border-dashed border-gray-300">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Generado por Agrotech</p>
                </div>
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
                        <div className="overflow-x-auto">
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
                    </div>

                    {/* Resumen Financiero */}
                    {selectedSections.includes('resumen') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">RESUMEN FINANCIERO</h4>
                            <div className="overflow-x-auto">
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
                        </div>
                    )}

                    {/* Indicadores de Rentabilidad */}
                    {selectedSections.includes('rentabilidad') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">INDICADORES DE RENTABILIDAD</h4>
                            <div className="overflow-x-auto">
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
                        </div>
                    )}

                    {/* Desglose de Costos */}
                    {selectedSections.includes('costos') && (
                        <div>
                            <h4 className="font-bold text-green-600 mb-2 pb-1 border-b-2 border-green-600">DESGLOSE DE COSTOS</h4>
                            <div className="overflow-x-auto">
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
                        </div>
                    )}

                    {/* Actividades */}
                    {selectedSections.includes('actividades') && (
                        <div>
                            {renderColumnToggler(
                                `ACTIVIDADES REALIZADAS (${data.actividades.length})`,
                                COLUMNS_ACTIVIDADES,
                                visibleColsActividades,
                                setVisibleColsActividades
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {COLUMNS_ACTIVIDADES.map(col =>
                                                visibleColsActividades.has(col.uid) && (
                                                    <th key={col.uid} className="border border-gray-300 p-2 text-left">{col.name}</th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.actividades.slice(0, 5).map((act, idx) => (
                                            <tr key={act.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {visibleColsActividades.has("fecha") && <td className="border border-gray-300 p-2">{new Date(act.fecha).toLocaleDateString('es-CO')}</td>}
                                                {visibleColsActividades.has("nombre") && <td className="border border-gray-300 p-2 font-semibold">{act.nombre}</td>}
                                                {visibleColsActividades.has("tipo") && <td className="border border-gray-300 p-2">{act.tipo}</td>}
                                                {visibleColsActividades.has("responsable") && <td className="border border-gray-300 p-2">{act.responsable}</td>}
                                                {visibleColsActividades.has("horas") && <td className="border border-gray-300 p-2 text-right">{act.horasTrabajadas}h</td>}
                                                {visibleColsActividades.has("costo") && <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(act.costoManoObra)}</td>}
                                            </tr>
                                        ))}
                                        {data.actividades.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={Array.from(visibleColsActividades).length} className="border border-gray-300 p-2 text-center text-gray-600 italic">
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
                            {renderColumnToggler(
                                `INSUMOS UTILIZADOS (${data.insumos.length})`,
                                COLUMNS_INSUMOS,
                                visibleColsInsumos,
                                setVisibleColsInsumos
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {COLUMNS_INSUMOS.map(col =>
                                                visibleColsInsumos.has(col.uid) && (
                                                    <th key={col.uid} className="border border-gray-300 p-2 text-left">{col.name}</th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.insumos.slice(0, 5).map((ins, idx) => (
                                            <tr key={ins.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {visibleColsInsumos.has("nombre") && <td className="border border-gray-300 p-2 font-semibold">{ins.nombre}</td>}
                                                {visibleColsInsumos.has("categoria") && <td className="border border-gray-300 p-2">{ins.categoria}</td>}
                                                {visibleColsInsumos.has("cantidad") && <td className="border border-gray-300 p-2 text-right">{ins.cantidad} {ins.unidad}</td>}
                                                {visibleColsInsumos.has("precio") && <td className="border border-gray-300 p-2 text-right">{formatCurrency(ins.precioUnitario)}</td>}
                                                {visibleColsInsumos.has("total") && <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(ins.total)}</td>}
                                            </tr>
                                        ))}
                                        {data.insumos.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={Array.from(visibleColsInsumos).length} className="border border-gray-300 p-2 text-center text-gray-600 italic">
                                                    ... y {data.insumos.length - 5} insumos más (ver archivo exportado)
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-200 font-bold">
                                            <td colSpan={Math.max(1, Array.from(visibleColsInsumos).length - 1)} className="border border-gray-300 p-2">TOTAL INSUMOS</td>
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
                            {renderColumnToggler(
                                `VENTAS REALIZADAS (${data.ventas.length})`,
                                COLUMNS_VENTAS,
                                visibleColsVentas,
                                setVisibleColsVentas
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {COLUMNS_VENTAS.map(col =>
                                                visibleColsVentas.has(col.uid) && (
                                                    <th key={col.uid} className="border border-gray-300 p-2 text-left">{col.name}</th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.ventas.slice(0, 5).map((v, idx) => (
                                            <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {visibleColsVentas.has("fecha") && <td className="border border-gray-300 p-2">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>}
                                                {visibleColsVentas.has("producto") && <td className="border border-gray-300 p-2 font-semibold">{v.producto}</td>}
                                                {visibleColsVentas.has("cliente") && <td className="border border-gray-300 p-2">{v.cliente}</td>}
                                                {visibleColsVentas.has("cantidad") && <td className="border border-gray-300 p-2 text-right">{v.cantidad} kg</td>}
                                                {visibleColsVentas.has("precio") && <td className="border border-gray-300 p-2 text-right">{formatCurrency(v.precioUnitario)}</td>}
                                                {visibleColsVentas.has("total") && <td className="border border-gray-300 p-2 text-right font-semibold">{formatCurrency(v.total)}</td>}
                                            </tr>
                                        ))}
                                        {data.ventas.length > 5 && (
                                            <tr className="bg-yellow-50">
                                                <td colSpan={Array.from(visibleColsVentas).length} className="border border-gray-300 p-2 text-center text-gray-600 italic">
                                                    ... y {data.ventas.length - 5} ventas más (ver archivo exportado)
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-200 font-bold">
                                            <td colSpan={Math.max(1, Array.from(visibleColsVentas).length - 1)} className="border border-gray-300 p-2">TOTAL VENTAS</td>
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
                            {renderColumnToggler(
                                `COSECHAS (${data.cosechas?.length || 0})`,
                                COLUMNS_COSECHAS,
                                visibleColsCosechas,
                                setVisibleColsCosechas
                            )}
                            {data.cosechas && data.cosechas.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                {COLUMNS_COSECHAS.map(col =>
                                                    visibleColsCosechas.has(col.uid) && (
                                                        <th key={col.uid} className="border border-gray-300 p-2 text-left">{col.name}</th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.cosechas.slice(0, 5).map((c, idx) => (
                                                <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    {visibleColsCosechas.has("fecha") && <td className="border border-gray-300 p-2">{new Date(c.fecha).toLocaleDateString('es-CO')}</td>}
                                                    {visibleColsCosechas.has("producto") && <td className="border border-gray-300 p-2">{c.producto}</td>}
                                                    {visibleColsCosechas.has("cantidad") && <td className="border border-gray-300 p-2 text-right">{c.cantidad} kg</td>}
                                                    {visibleColsCosechas.has("calidad") && <td className="border border-gray-300 p-2">{c.calidad}</td>}
                                                    {visibleColsCosechas.has("costoUnit") && <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.costoUnitario)}</td>}
                                                    {visibleColsCosechas.has("total") && <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.costoTotal)}</td>}
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
                                <div className="overflow-x-auto">
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
                                </div>
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
                    <div>{COLUMNS_ACTIVIDADES.filter(c => visibleColsActividades.has(c.uid)).map(c => c.name).join(',')}</div>
                    {data.actividades.map((act) => (
                        <div key={act.id}>
                            {[
                                visibleColsActividades.has('fecha') ? act.fecha : null,
                                visibleColsActividades.has('nombre') ? act.nombre : null,
                                visibleColsActividades.has('tipo') ? act.tipo : null,
                                visibleColsActividades.has('responsable') ? act.responsable : null,
                                visibleColsActividades.has('horas') ? act.horasTrabajadas : null,
                                visibleColsActividades.has('costo') ? act.costoManoObra : null
                            ].filter(x => x !== null).join(',')}
                        </div>
                    ))}
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('insumos') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,INSUMOS</div>
                    <div>{COLUMNS_INSUMOS.filter(c => visibleColsInsumos.has(c.uid)).map(c => c.name).join(',')}</div>
                    {data.insumos.map((ins) => (
                        <div key={ins.id}>
                            {[
                                visibleColsInsumos.has('nombre') ? ins.nombre : null,
                                visibleColsInsumos.has('categoria') ? ins.categoria : null,
                                visibleColsInsumos.has('cantidad') ? `${ins.cantidad} ${ins.unidad}` : null,
                                visibleColsInsumos.has('precio') ? ins.precioUnitario : null,
                                visibleColsInsumos.has('total') ? ins.total : null
                            ].filter(x => x !== null).join(',')}
                        </div>
                    ))}
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('ventas') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,VENTAS</div>
                    <div>{COLUMNS_VENTAS.filter(c => visibleColsVentas.has(c.uid)).map(c => c.name).join(',')}</div>
                    {data.ventas.map((v) => (
                        <div key={v.id}>
                            {[
                                visibleColsVentas.has('fecha') ? new Date(v.fecha).toLocaleDateString() : null,
                                visibleColsVentas.has('producto') ? v.producto : null,
                                visibleColsVentas.has('cliente') ? v.cliente : null,
                                visibleColsVentas.has('cantidad') ? v.cantidad : null,
                                visibleColsVentas.has('precio') ? v.precioUnitario : null,
                                visibleColsVentas.has('total') ? v.total : null
                            ].filter(x => x !== null).join(',')}
                        </div>
                    ))}
                    <div className="mb-3"></div>
                </>
            )}

            {selectedSections.includes('cosechas') && (
                <>
                    <div className="text-yellow-400 mb-1">SECCION,COSECHAS</div>
                    <div>{COLUMNS_COSECHAS.filter(c => visibleColsCosechas.has(c.uid)).map(c => c.name).join(',')}</div>
                    {data.cosechas?.map((c) => (
                        <div key={c.id}>
                            {[
                                visibleColsCosechas.has('fecha') ? new Date(c.fecha).toLocaleDateString() : null,
                                visibleColsCosechas.has('producto') ? c.producto : null,
                                visibleColsCosechas.has('cantidad') ? c.cantidad : null,
                                visibleColsCosechas.has('calidad') ? c.calidad : null,
                                visibleColsCosechas.has('costoUnit') ? c.costoUnitario : null,
                                visibleColsCosechas.has('total') ? c.costoTotal : null
                            ].filter(x => x !== null).join(',')}
                        </div>
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
