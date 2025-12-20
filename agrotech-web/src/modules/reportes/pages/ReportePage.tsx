import { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Select,
    SelectItem,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Checkbox,
    CheckboxGroup,
    Divider,
    Chip,
} from '@heroui/react';
import {
    Download,
    Calendar,
    Package,
    TrendingUp,
    BarChart as BarChartIcon,
    Printer,
    FileText,
} from 'lucide-react';
import { IoTApi } from '../../iot/api/iot.api';
import { useCultivosList } from '../../cultivos/hooks/useCultivos';
import { useReporteCompleto } from '../hooks/useReportes';
import { exportToXLSX } from '@/shared/utils/exportUtils';
import { ReporteChart } from '../ui/widgets/ReporteChart';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ReportePDF } from '../ui/pdfs/ReportePDF';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export default function ReportePage() {
    const [cultivoId, setCultivoId] = useState<number | undefined>();
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | null>(null);
    const [previewIotData, setPreviewIotData] = useState<any>(null);

    const [selectedSections, setSelectedSections] = useState<string[]>([
        'resumen',
        'costos',
        'rentabilidad',
        'actividades',
        'insumos',
        'ventas',
        'cosechas',
        'monitoreo'
    ]);

    const { data: cultivos = [] } = useCultivosList({ limit: 100 });
    const { data: reporteCompleto, isLoading } = useReporteCompleto({
        cultivoId: cultivoId,
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
    });

    const sections = [
        { key: 'resumen', label: 'Resumen Ejecutivo' },
        { key: 'costos', label: 'Desglose de Costos' },
        { key: 'rentabilidad', label: 'Indicadores de Rentabilidad' },
        { key: 'actividades', label: 'Actividades Realizadas' },
        { key: 'insumos', label: 'Insumos Utilizados' },
        { key: 'ventas', label: 'Ventas y Producción' },
        { key: 'cosechas', label: 'Lotes de Producción (Cosechas)' },
        { key: 'monitoreo', label: 'Monitoreo IoT' },
    ];

    const handleExportPreview = async (format: 'pdf' | 'excel' | 'csv') => {
        setExportFormat(format);

        // Calculate default dates if not provided
        const now = new Date();
        const defaultEndDate = now.toISOString().split('T')[0];
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const defaultStartDate = d.toISOString().split('T')[0];

        const effectiveStartDate = fechaDesde || defaultStartDate;
        const effectiveEndDate = fechaHasta || defaultEndDate;

        // Fetch IoT data if needed for preview
        if (selectedSections.includes('monitoreo') && cultivoId) {
            const selectedCultivo = cultivos.find(c => c.id === cultivoId);
            // Robust lookup for loteId
            const loteId = selectedCultivo?.idLote
                || (selectedCultivo as any)?.loteId
                || selectedCultivo?.lote?.id
                || selectedCultivo?.sublote?.idLote;

            if (loteId) {
                try {
                    const iotData = await IoTApi.getGeneralReport({
                        loteId: loteId,
                        startDate: effectiveStartDate,
                        endDate: effectiveEndDate
                    });
                    setPreviewIotData(iotData);
                } catch (e) {
                    console.error("Error fetching IoT for preview", e);
                    setPreviewIotData(null);
                }
            } else {
                console.warn("Selected crop has no assigned Lote ID. IoT report skipped.");
                setPreviewIotData(null);
            }
        } else {
            setPreviewIotData(null);
        }

        setIsPreviewOpen(true);
    };

    const handleConfirmExport = async () => {
        if (!reporteCompleto || !exportFormat) return;
        const cultivoNombre = cultivos.find((c) => c.id === cultivoId)?.nombre || 'General';

        if (exportFormat === 'excel' || exportFormat === 'csv') {
            // Excel/CSV export logic here
            const excelRows: any[] = [];

            if (selectedSections.includes('resumen')) {
                excelRows.push(['RESUMEN FINANCIERO']);
                excelRows.push(['Concepto', 'Valor']);
                excelRows.push(['Costos Totales', reporteCompleto.resumen.costoTotal]);
                excelRows.push(['Ingresos Totales', reporteCompleto.resumen.ingresoTotal]);
                excelRows.push(['Utilidad Neta', reporteCompleto.resumen.utilidadNeta]);
                excelRows.push([]);
            }

            exportToXLSX(excelRows, `reporte-${cultivoNombre}`);
        }
        setIsPreviewOpen(false);
    };

    const hasData = reporteCompleto && cultivoId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reportes de Cultivos</h1>
                    <p className="text-foreground-500 mt-1">Análisis completo de costos, rentabilidad y producción</p>
                </div>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Filtros de Búsqueda</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Cultivo"
                            placeholder="Seleccionar cultivo"
                            selectedKeys={cultivoId ? [cultivoId.toString()] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0];
                                setCultivoId(selected ? Number(selected) : undefined);
                            }}
                            aria-label="Seleccionar cultivo para el reporte"
                        >
                            {cultivos.map((cultivo) => (
                                <SelectItem key={cultivo.id.toString()}>
                                    {cultivo.nombre}
                                </SelectItem>
                            ))}
                        </Select>

                        <Input
                            type="date"
                            label="Fecha Desde"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            startContent={<Calendar className="h-4 w-4" />}
                        />

                        <Input
                            type="date"
                            label="Fecha Hasta"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            startContent={<Calendar className="h-4 w-4" />}
                        />
                    </div>

                    <Divider className="my-4" />

                    <div className="flex gap-2 justify-start">
                        <Button
                            color="danger"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={() => handleExportPreview('pdf')}
                            isDisabled={!hasData}
                            className="font-semibold text-white"
                            aria-label="Exportar reporte como PDF"
                        >
                            Exportar PDF
                        </Button>
                        <Button
                            color="success"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={() => handleExportPreview('excel')}
                            isDisabled={!hasData}
                            className="font-semibold text-white"
                            aria-label="Exportar reporte como Excel"
                        >
                            Exportar Excel
                        </Button>
                        <Button
                            color="primary"
                            startContent={<Package className="h-4 w-4" />}
                            onPress={() => handleExportPreview('csv')}
                            isDisabled={!hasData}
                            className="font-semibold"
                            aria-label="Exportar reporte como CSV"
                        >
                            Exportar CSV
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Summary Cards */}
            {hasData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-success-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-success-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-500">Ingresos Totales</p>
                                        <p className="text-xl font-bold text-success-600">
                                            ${reporteCompleto.resumen.ingresoTotal.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-danger-100 rounded-lg">
                                        <Package className="h-6 w-6 text-danger-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-500">Costos Totales</p>
                                        <p className="text-xl font-bold text-danger-600">
                                            ${reporteCompleto.resumen.costoTotal.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-warning-100 rounded-lg">
                                        <BarChartIcon className="h-6 w-6 text-warning-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-500">Utilidad Neta</p>
                                        <p className={`text-xl font-bold ${reporteCompleto.resumen.utilidadNeta >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                            ${reporteCompleto.resumen.utilidadNeta.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-500">Margen Neto</p>
                                        <p className="text-xl font-bold text-primary-600">
                                            {reporteCompleto.resumen.margenNeto.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Rentabilidad Indicators */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Indicadores de Rentabilidad</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-success-100 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-success-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground-500 mb-1">ROI (Retorno sobre Inversión)</p>
                                        <p className="text-2xl font-bold text-success-600">
                                            {reporteCompleto.resumen.roi.toFixed(2)}%
                                        </p>
                                        <p className="text-xs text-foreground-400 mt-1">
                                            {reporteCompleto.resumen.roi >= 0 ? 'Inversión rentable' : 'Inversión no rentable'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary-100 rounded-lg">
                                        <BarChartIcon className="h-8 w-8 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground-500 mb-1">Relación Beneficio/Costo</p>
                                        <p className="text-2xl font-bold text-primary-600">
                                            {reporteCompleto.resumen.relacionBC.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-foreground-400 mt-1">
                                            {reporteCompleto.resumen.relacionBC > 1
                                                ? 'Proyecto viable'
                                                : reporteCompleto.resumen.relacionBC === 1
                                                    ? 'Punto de equilibrio'
                                                    : 'Proyecto no viable'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}

            {/* Chart */}
            {hasData && (
                <div className="mt-6">
                    <ReporteChart
                        reporte={{
                            costo_insumos: reporteCompleto.costos.insumos || 0,
                            costo_mano_obra: reporteCompleto.costos.manoObra || 0,
                            costo_maquinaria: reporteCompleto.costos.maquinaria || 0,
                            ingresos_ventas: reporteCompleto.resumen.ingresoTotal || 0,
                            utilidad: reporteCompleto.resumen.utilidadNeta || 0,
                            id_cultivo: cultivoId,
                            fecha_desde: fechaDesde,
                            fecha_hasta: fechaHasta
                        }}
                    />
                </div>
            )}

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="4xl" scrollBehavior="inside">
                <ModalContent>
                    {/* Header removed from here to maximize preview space */}
                    <ModalBody className="p-0 bg-gray-50/30 overflow-hidden">
                        <div className="grid grid-cols-12 gap-0 h-[75vh]">
                            {/* Left Panel - Configuration */}
                            <div className="col-span-12 md:col-span-4 border-r border-dashed border-gray-200 bg-white p-6 flex flex-col h-full overflow-hidden">
                                {/* Header integrated into sidebar - Inline Logo & Title */}
                                <div className="flex items-center gap-3 mb-6 border-b border-dashed border-gray-200 pb-4">
                                    <img src="/logoAgrotech.png" alt="Agrotech" className="h-8 w-auto object-contain" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-900 font-bold font-mono tracking-widest uppercase">Agrotech</span>
                                        <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Generar Reporte</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest mb-4">Secciones a Incluir</h3>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <CheckboxGroup value={selectedSections} onValueChange={setSelectedSections} className="gap-3">
                                        {sections.map((section) => (
                                            <div key={section.key} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedSections.includes(section.key) ? 'border-success-200 bg-success-50/50' : 'border-dashed border-gray-200 hover:border-gray-300'}`}>
                                                <Checkbox value={section.key} color="success" classNames={{ label: "text-sm font-medium text-gray-700" }}>
                                                    {section.label}
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </CheckboxGroup>
                                </div>

                            </div>



                            {/* Right Panel - Live Preview */}
                            <div className="col-span-12 md:col-span-8 bg-gray-100/50 p-6 overflow-y-auto flex justify-center items-start">
                                {reporteCompleto && exportFormat === 'pdf' ? (
                                    <div className="w-full h-full bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Vista Previa del PDF</h3>
                                            <span className="text-xs text-gray-500">Formato A4</span>
                                        </div>
                                        <div className="h-[calc(100%-48px)]">
                                            <ErrorBoundary
                                                fallback={
                                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                                            <FileText className="w-8 h-8 text-red-600" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            Error al generar vista previa
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-4">
                                                            No se pudo renderizar la vista previa del PDF.
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Puedes intentar descargar el PDF directamente.
                                                        </p>
                                                    </div>
                                                }
                                            >
                                                <PDFViewer
                                                    key={`preview-${cultivoId}-${selectedSections.join('-')}`}
                                                    width="100%"
                                                    height="100%"
                                                    showToolbar={false}
                                                    className="border-0"
                                                >
                                                    <ReportePDF
                                                        data={reporteCompleto}
                                                        cultivoNombre={cultivos.find((c) => c.id === cultivoId)?.nombre || 'General'}
                                                        selectedSections={selectedSections}
                                                        iotData={previewIotData}
                                                    />
                                                </PDFViewer>
                                            </ErrorBoundary>
                                        </div>
                                    </div>
                                ) : reporteCompleto && exportFormat !== 'pdf' ? (
                                    <div className="w-full max-w-sm bg-white shadow-sm rounded-lg border border-gray-100 p-8 text-center">
                                        <p className="text-gray-500">Vista previa no disponible para {exportFormat?.toUpperCase()}</p>
                                        <p className="text-sm text-gray-400 mt-2">Haz clic en Descargar para obtener el archivo</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-white border-t border-dashed border-gray-200 justify-between items-center py-4">
                        <Button variant="light" onPress={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                            Cancelar
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="flat"
                                startContent={<Printer size={18} />}
                                onPress={() => window.print()}
                                className="hidden md:flex text-gray-600"
                                aria-label="Imprimir reporte"
                            >
                                Imprimir
                            </Button>
                            {exportFormat === 'pdf' ? (
                                <ErrorBoundary
                                    fallback={
                                        <Button
                                            color="danger"
                                            variant="flat"
                                            startContent={<Download className="h-4 w-4" />}
                                            onPress={() => setIsPreviewOpen(false)}
                                        >
                                            Error al generar PDF
                                        </Button>
                                    }
                                >
                                    <PDFDownloadLink
                                        key={`pdf-${cultivoId}-${selectedSections.join('-')}`}
                                        document={
                                            <ReportePDF
                                                data={reporteCompleto}
                                                cultivoNombre={cultivos.find((c) => c.id === cultivoId)?.nombre || 'General'}
                                                selectedSections={selectedSections}
                                                iotData={previewIotData}
                                            />
                                        }
                                        fileName={`reporte-${cultivoId}.pdf`}
                                    >
                                        {({ loading }) => (
                                            <Button
                                                className="bg-gray-900 text-white shadow-sm font-medium"
                                                startContent={<Download className="h-4 w-4" />}
                                                isLoading={loading}
                                            >
                                                {loading ? 'Generando...' : 'Descargar PDF'}
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                </ErrorBoundary>
                            ) : (
                                <Button
                                    className="bg-gray-900 text-white shadow-sm font-medium"
                                    startContent={<Download className="h-4 w-4" />}
                                    onPress={handleConfirmExport}
                                >
                                    Descargar {exportFormat?.toUpperCase()}
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Loading */}
            {isLoading && (
                <Card>
                    <CardBody className="text-center py-12">
                        <div className="animate-pulse">
                            <Package className="h-16 w-16 mx-auto text-success-400 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">Generando análisis financiero...</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* No Data */}
            {!isLoading && !hasData && (
                <Card className="border-2 border-dashed border-gray-300">
                    <CardBody className="text-center py-16">
                        <Package className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-700">Seleccione un cultivo para comenzar</h3>
                        <p className="text-gray-600 mb-4">
                            Configure los filtros arriba para generar un análisis detallado de rentabilidad
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Chip color="success" variant="flat">Relación B/C</Chip>
                            <Chip color="primary" variant="flat">ROI</Chip>
                            <Chip color="warning" variant="flat">Márgenes</Chip>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
