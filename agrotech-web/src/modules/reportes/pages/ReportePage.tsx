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
} from 'lucide-react';
import { IoTApi } from '../../iot/api/iot.api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useCultivosList } from '../../cultivos/hooks/useCultivos';
import { useReporteCompleto } from '../hooks/useReportes';
import { exportToXLSX } from '@/shared/utils/exportUtils';
import { FormatPreview } from '../ui/components/FormatPreview';

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
            const loteId = selectedCultivo?.idLote || (selectedCultivo as any)?.loteId;

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
                console.warn("Selected crop has no assigned Lote ID.");
            }
        } else {
            setPreviewIotData(null);
        }

        setIsPreviewOpen(true);
    };

    // Helper function to create chart image for PDF
    const createChartImage = async (chartData: any[]): Promise<string | null> => {
        return new Promise((resolve) => {
            try {
                // Create a temporary container for the chart
                const container = document.createElement('div');
                container.style.width = '600px';
                container.style.height = '300px';
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                document.body.appendChild(container);

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    document.body.removeChild(container);
                    resolve(null);
                    return;
                }

                // Draw white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw grid
                ctx.strokeStyle = '#e5e7eb';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const y = (canvas.height / 5) * i;
                    ctx.beginPath();
                    ctx.moveTo(50, y);
                    ctx.lineTo(canvas.width - 20, y);
                    ctx.stroke();
                }

                // Find min and max values
                const values = chartData.map((d: any) => parseFloat(d.valor) || 0);
                const minVal = Math.min(...values);
                const maxVal = Math.max(...values);
                const range = maxVal - minVal || 1;

                // Draw line chart
                ctx.strokeStyle = '#0ea5e9';
                ctx.lineWidth = 2;
                ctx.beginPath();

                chartData.forEach((point: any, index: number) => {
                    const x = 50 + ((canvas.width - 70) / (chartData.length - 1 || 1)) * index;
                    const normalizedValue = ((parseFloat(point.valor) || 0) - minVal) / range;
                    const y = canvas.height - 40 - (normalizedValue * (canvas.height - 60));

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();

                // Draw title
                ctx.fillStyle = '#374151';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('Tendencia de Sensores (Ultimas 24h)', 50, 20);

                // Cleanup
                document.body.removeChild(container);

                // Convert to image
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                console.error('Error creating chart:', error);
                resolve(null);
            }
        });
    };

    const handleConfirmExport = async () => {
        if (!reporteCompleto || !exportFormat) return;

        const cultivoNombre = cultivos.find((c) => c.id === cultivoId)?.nombre || 'General';

        if (exportFormat === 'pdf') {
            // Generate PDF using jsPDF
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            let yPosition = 20;

            // Helper function for currency formatting
            const formatCurrency = (val: number) =>
                new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(val);

            // Add Logo
            const logoImg = new Image();
            logoImg.src = '/LogoTic.png';
            try {
                const logoWidth = 40;
                const logoHeight = 16;
                doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
                yPosition += logoHeight + 8;
            } catch (e) {
                console.log('Logo not loaded, continuing without it');
            }

            // Title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 197, 94); // Green color
            doc.text('REPORTE DE CULTIVO', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;

            // Subtitle
            doc.setFontSize(14);
            doc.setTextColor(100, 100, 100);
            doc.text(cultivoNombre, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            // Date and filters
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 14, yPosition);
            yPosition += 5;
            if (fechaDesde && fechaHasta) {
                doc.text(`Período: ${new Date(fechaDesde).toLocaleDateString('es-CO')} - ${new Date(fechaHasta).toLocaleDateString('es-CO')}`, 14, yPosition);
                yPosition += 8;
            } else {
                yPosition += 3;
            }

            // Horizontal line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, yPosition, pageWidth - 14, yPosition);
            yPosition += 8;

            // RESUMEN EJECUTIVO
            if (selectedSections.includes('resumen')) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(34, 197, 94);
                doc.text('Resumen Ejecutivo', 14, yPosition);
                yPosition += 2;
                doc.setDrawColor(34, 197, 94);
                doc.setLineWidth(0.3);
                doc.line(14, yPosition, 70, yPosition);
                yPosition += 10;

                // Colored summary cards (matching preview)
                const cardWidth = 58;
                const cardHeight = 25;
                const cardSpacing = 5;
                const startX = 14;

                // Card 1: Costos Totales (Red background)
                doc.setFillColor(254, 226, 226); // Light red background
                doc.roundedRect(startX, yPosition, cardWidth, cardHeight, 2, 2, 'F');
                doc.setDrawColor(254, 202, 202);
                doc.roundedRect(startX, yPosition, cardWidth, cardHeight, 2, 2, 'S');

                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text('Costos Totales', startX + cardWidth / 2, yPosition + 8, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(220, 38, 38); // Red text
                doc.text(formatCurrency(reporteCompleto.resumen.costoTotal), startX + cardWidth / 2, yPosition + 18, { align: 'center' });

                // Card 2: Ingresos Totales (Green background)
                const card2X = startX + cardWidth + cardSpacing;
                doc.setFillColor(220, 252, 231); // Light green background
                doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
                doc.setDrawColor(187, 247, 208);
                doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'S');

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('Ingresos Totales', card2X + cardWidth / 2, yPosition + 8, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(22, 163, 74); // Green text
                doc.text(formatCurrency(reporteCompleto.resumen.ingresoTotal), card2X + cardWidth / 2, yPosition + 18, { align: 'center' });

                // Card 3: Utilidad Neta (Blue/Red background depending on value)
                const card3X = card2X + cardWidth + cardSpacing;
                const isPositive = reporteCompleto.resumen.utilidadNeta >= 0;
                doc.setFillColor(isPositive ? 220 : 254, isPositive ? 252 : 226, isPositive ? 231 : 226); // Green or red
                doc.roundedRect(card3X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
                doc.setDrawColor(isPositive ? 187 : 254, isPositive ? 247 : 202, isPositive ? 208 : 202);
                doc.roundedRect(card3X, yPosition, cardWidth, cardHeight, 2, 2, 'S');

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('Utilidad Neta', card3X + cardWidth / 2, yPosition + 8, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(isPositive ? 22 : 220, isPositive ? 163 : 38, isPositive ? 74 : 38);
                doc.text(formatCurrency(reporteCompleto.resumen.utilidadNeta), card3X + cardWidth / 2, yPosition + 18, { align: 'center' });

                yPosition += cardHeight + 10;

                // Additional indicators table
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Indicador', 'Valor', 'Estado']],
                    body: [
                        ['Margen Neto', `${reporteCompleto.resumen.margenNeto.toFixed(2)}%`,
                            reporteCompleto.resumen.margenNeto >= 20 ? 'Bueno' : 'Regular'],
                        ['ROI', `${reporteCompleto.resumen.roi.toFixed(2)}%`,
                            reporteCompleto.resumen.roi >= 0 ? 'Rentable' : 'No rentable'],
                        ['Relacion B/C', reporteCompleto.resumen.relacionBC.toFixed(2),
                            reporteCompleto.resumen.relacionBC > 1 ? 'Viable' : 'No viable'],
                    ],
                    theme: 'grid',
                    headStyles: {
                        fillColor: [34, 197, 94],
                        fontSize: 10,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { fontStyle: 'bold', cellWidth: 60 },
                        1: { halign: 'right', cellWidth: 60 },
                        2: { halign: 'center', cellWidth: 'auto' }
                    },
                    styles: { fontSize: 9 }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // DESGLOSE DE COSTOS
            if (selectedSections.includes('costos') && reporteCompleto.costos) {
                if (yPosition > 230) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(239, 68, 68); // Red color
                doc.text('DESGLOSE DE COSTOS', 14, yPosition);
                yPosition += 8;

                const costosData = [
                    ['Insumos', formatCurrency(reporteCompleto.costos.insumos || 0),
                        `${((reporteCompleto.costos.insumos || 0) / reporteCompleto.resumen.costoTotal * 100).toFixed(1)}%`],
                    ['Mano de Obra', formatCurrency(reporteCompleto.costos.manoObra || 0),
                        `${((reporteCompleto.costos.manoObra || 0) / reporteCompleto.resumen.costoTotal * 100).toFixed(1)}%`],
                    ['Maquinaria', formatCurrency(reporteCompleto.costos.maquinaria || 0),
                        `${((reporteCompleto.costos.maquinaria || 0) / reporteCompleto.resumen.costoTotal * 100).toFixed(1)}%`],
                    ['Otros', formatCurrency(reporteCompleto.costos.otros || 0),
                        `${((reporteCompleto.costos.otros || 0) / reporteCompleto.resumen.costoTotal * 100).toFixed(1)}%`],
                ];

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Categoría', 'Monto', '% del Total']],
                    body: costosData,
                    foot: [['TOTAL', formatCurrency(reporteCompleto.resumen.costoTotal), '100%']],
                    theme: 'striped',
                    headStyles: { fillColor: [239, 68, 68], fontSize: 11, fontStyle: 'bold' },
                    footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
                    columnStyles: {
                        0: { fontStyle: 'bold' },
                        1: { halign: 'right' },
                        2: { halign: 'center' }
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // INDICADORES DE RENTABILIDAD
            if (selectedSections.includes('rentabilidad')) {
                if (yPosition > 230) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(59, 130, 246); // Blue color
                doc.text('INDICADORES DE RENTABILIDAD', 14, yPosition);
                yPosition += 8;

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Indicador', 'Valor', 'Interpretación']],
                    body: [
                        ['Relación Beneficio/Costo', reporteCompleto.resumen.relacionBC.toFixed(2),
                            reporteCompleto.resumen.relacionBC > 1
                                ? 'Por cada peso invertido se obtienen ' + reporteCompleto.resumen.relacionBC.toFixed(2) + ' pesos'
                                : 'Proyecto no rentable'],
                        ['ROI (Retorno sobre Inversión)', `${reporteCompleto.resumen.roi.toFixed(2)}%`,
                            reporteCompleto.resumen.roi >= 0
                                ? 'Retorno positivo del ' + reporteCompleto.resumen.roi.toFixed(2) + '%'
                                : 'Pérdida del ' + Math.abs(reporteCompleto.resumen.roi).toFixed(2) + '%'],
                        ['Margen de Utilidad Neta', `${reporteCompleto.resumen.margenNeto.toFixed(2)}%`,
                            reporteCompleto.resumen.margenNeto >= 20
                                ? 'Excelente margen de ganancia'
                                : reporteCompleto.resumen.margenNeto >= 10
                                    ? 'Margen aceptable'
                                    : 'Margen bajo, requiere optimización'],
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                    columnStyles: {
                        0: { fontStyle: 'bold', cellWidth: 60 },
                        1: { halign: 'center', cellWidth: 40 },
                        2: { cellWidth: 'auto' }
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // ACTIVIDADES REALIZADAS
            if (selectedSections.includes('actividades') && reporteCompleto.actividades?.length > 0) {
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(168, 85, 247); // Purple color
                doc.text('ACTIVIDADES REALIZADAS', 14, yPosition);
                yPosition += 8;

                const actividadesData = reporteCompleto.actividades.slice(0, 15).map((act: any) => [
                    new Date(act.fecha).toLocaleDateString('es-CO'),
                    act.tipo || 'N/A',
                    act.descripcion?.substring(0, 50) || 'N/A',
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Fecha', 'Tipo', 'Descripción']],
                    body: actividadesData,
                    theme: 'grid',
                    headStyles: { fillColor: [168, 85, 247], fontSize: 10, fontStyle: 'bold' },
                    styles: { fontSize: 9 },
                    columnStyles: {
                        0: { cellWidth: 30 },
                        1: { cellWidth: 40 },
                        2: { cellWidth: 'auto' }
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // INSUMOS UTILIZADOS
            if (selectedSections.includes('insumos') && reporteCompleto.insumos?.length > 0) {
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(234, 179, 8); // Yellow color
                doc.text('INSUMOS UTILIZADOS', 14, yPosition);
                yPosition += 8;

                const insumosData = reporteCompleto.insumos.slice(0, 15).map((ins: any) => [
                    ins.nombre || 'N/A',
                    ins.cantidad?.toString() || '0',
                    ins.unidad || 'Unidad',
                    formatCurrency(ins.costoTotal || 0),
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Insumo', 'Cantidad', 'Unidad', 'Costo Total']],
                    body: insumosData,
                    theme: 'striped',
                    headStyles: { fillColor: [234, 179, 8], fontSize: 10, fontStyle: 'bold' },
                    styles: { fontSize: 9 },
                    columnStyles: {
                        3: { halign: 'right' }
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // VENTAS Y PRODUCCIÓN
            if (selectedSections.includes('ventas') && reporteCompleto.ventas?.length > 0) {
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(34, 197, 94); // Green color
                doc.text('VENTAS Y PRODUCCION', 14, yPosition);
                yPosition += 8;

                const ventasData = reporteCompleto.ventas.slice(0, 15).map((v: any) => [
                    new Date(v.fecha).toLocaleDateString('es-CO'),
                    v.producto || 'N/A',
                    v.cantidad?.toString() || '0',
                    formatCurrency(v.precioUnitario || 0),
                    formatCurrency(v.total || 0),
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Fecha', 'Producto', 'Cantidad', 'Precio Unit.', 'Total']],
                    body: ventasData,
                    foot: [['', '', '', 'TOTAL VENTAS:', formatCurrency(reporteCompleto.ventas.reduce((sum: number, v: any) => sum + (v.total || 0), 0))]],
                    theme: 'grid',
                    headStyles: { fillColor: [34, 197, 94], fontSize: 10, fontStyle: 'bold' },
                    footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
                    styles: { fontSize: 9 },
                    columnStyles: {
                        3: { halign: 'right' },
                        4: { halign: 'right' }
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // COSECHAS / LOTES DE PRODUCCIÓN
            if (selectedSections.includes('cosechas') && reporteCompleto.cosechas?.length > 0) {
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(22, 163, 74); // Dark green
                doc.text('LOTES DE PRODUCCION (COSECHAS)', 14, yPosition);
                yPosition += 8;

                const cosechasData = reporteCompleto.cosechas.map((c: any) => [
                    c.lote || 'N/A',
                    new Date(c.fechaCosecha).toLocaleDateString('es-CO'),
                    `${c.cantidadCosechada || 0} ${c.unidad || 'kg'}`,
                    c.calidad || 'N/A',
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Lote', 'Fecha Cosecha', 'Cantidad', 'Calidad']],
                    body: cosechasData,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 163, 74], fontSize: 10, fontStyle: 'bold' },
                    styles: { fontSize: 9 }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            // MONITOREO IOT
            if (selectedSections.includes('monitoreo') && previewIotData) {
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(34, 197, 94);
                doc.text('Monitoreo IoT', 14, yPosition);
                yPosition += 2;
                doc.setDrawColor(34, 197, 94);
                doc.setLineWidth(0.3);
                doc.line(14, yPosition, 55, yPosition);
                yPosition += 10;

                // IoT Summary cards (matching preview)
                const iotCardWidth = 58;
                const iotCardHeight = 20;
                const iotCardSpacing = 5;
                const iotStartX = 14;

                // Card 1: Total Sensores (Gray background)
                doc.setFillColor(249, 250, 251); // Light gray
                doc.roundedRect(iotStartX, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'F');
                doc.setDrawColor(229, 231, 235);
                doc.roundedRect(iotStartX, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'S');

                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Total Sensores', iotStartX + iotCardWidth / 2, yPosition + 7, { align: 'center' });
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text((previewIotData.totalSensors?.toString() || '0'), iotStartX + iotCardWidth / 2, yPosition + 15, { align: 'center' });

                // Card 2: Conectados (Green background)
                const iotCard2X = iotStartX + iotCardWidth + iotCardSpacing;
                doc.setFillColor(220, 252, 231); // Light green
                doc.roundedRect(iotCard2X, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'F');
                doc.setDrawColor(187, 247, 208);
                doc.roundedRect(iotCard2X, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'S');

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(21, 128, 61); // Dark green
                doc.text('Conectados', iotCard2X + iotCardWidth / 2, yPosition + 7, { align: 'center' });
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text((previewIotData.estados?.conectados?.toString() || '0'), iotCard2X + iotCardWidth / 2, yPosition + 15, { align: 'center' });

                // Card 3: Alertas Activas (Red background)
                const iotCard3X = iotCard2X + iotCardWidth + iotCardSpacing;
                doc.setFillColor(254, 226, 226); // Light red
                doc.roundedRect(iotCard3X, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'F');
                doc.setDrawColor(254, 202, 202);
                doc.roundedRect(iotCard3X, yPosition, iotCardWidth, iotCardHeight, 2, 2, 'S');

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(185, 28, 28); // Dark red
                doc.text('Alertas Activas', iotCard3X + iotCardWidth / 2, yPosition + 7, { align: 'center' });
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text((previewIotData.alertasActivas?.toString() || '0'), iotCard3X + iotCardWidth / 2, yPosition + 15, { align: 'center' });

                yPosition += iotCardHeight + 10;

                // Add IoT trend chart if data is available
                if (previewIotData.chartData && previewIotData.chartData.length > 0) {
                    if (yPosition > 180) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    try {
                        const chartImage = await createChartImage(previewIotData.chartData);
                        if (chartImage) {
                            // Add chart image to PDF
                            const chartWidth = 170;
                            const chartHeight = 85;
                            doc.addImage(chartImage, 'PNG', 14, yPosition, chartWidth, chartHeight);
                            yPosition += chartHeight + 10;
                        }
                    } catch (error) {
                        console.error('Error adding chart to PDF:', error);
                    }
                }


                // Averages table (matching preview structure)
                if (previewIotData.promedios && previewIotData.promedios.length > 0) {
                    if (yPosition > 220) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Promedios de Sensores', 14, yPosition);
                    yPosition += 6;

                    const promediosData = previewIotData.promedios.map((p: any) => [
                        p.label || 'N/A',
                        p.value?.toString() || '0',
                        previewIotData.minGlobal?.toString() || '0',
                        previewIotData.maxGlobal?.toString() || '0',
                        p.unit || '',
                    ]);

                    autoTable(doc, {
                        startY: yPosition,
                        head: [['Sensor', 'Promedio', 'Min', 'Max', 'Unidad']],
                        body: promediosData,
                        theme: 'striped',
                        headStyles: { fillColor: [99, 102, 241], fontSize: 10, fontStyle: 'bold' },
                        styles: { fontSize: 9 },
                        columnStyles: {
                            0: { fontStyle: 'bold' },
                            1: { halign: 'right' },
                            2: { halign: 'right' },
                            3: { halign: 'right' },
                            4: { halign: 'center' }
                        }
                    });

                    yPosition = (doc as any).lastAutoTable.finalY + 5;
                }

                // IoT Note
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text('Nota: Los datos IoT representan el monitoreo en tiempo real del cultivo.', 14, yPosition);
            }

            // Footer on last page
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Página ${i} de ${pageCount} | Generado por AgroTech SENA | ${new Date().toLocaleDateString('es-CO')}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Save PDF
            doc.save(`reporte-completo-${cultivoNombre}-${new Date().toISOString().split('T')[0]}.pdf`);
            setIsPreviewOpen(false);

        } else if (exportFormat === 'excel' || exportFormat === 'csv') {
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

                    <div className="flex gap-2">
                        <Button
                            color="success"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={() => handleExportPreview('pdf')}
                            isDisabled={!hasData}
                        >
                            Exportar PDF
                        </Button>
                        <Button
                            color="primary"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={() => handleExportPreview('excel')}
                            isDisabled={!hasData}
                        >
                            Exportar Excel
                        </Button>
                        <Button
                            color="secondary"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={() => handleExportPreview('csv')}
                            isDisabled={!hasData}
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
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Análisis Financiero</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        {
                                            name: 'Financiero',
                                            Ingresos: reporteCompleto.resumen.ingresoTotal,
                                            Costos: reporteCompleto.resumen.costoTotal,
                                            Utilidad: reporteCompleto.resumen.utilidadNeta,
                                        }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis
                                        tickFormatter={(value: number) =>
                                            new Intl.NumberFormat('es-CO', {
                                                style: 'currency',
                                                currency: 'COP',
                                                minimumFractionDigits: 0
                                            }).format(value)
                                        }
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Costos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Utilidad" fill="#eab308" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="5xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader className="bg-gradient-to-r from-success-600 to-primary-600 text-white">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-lg font-bold">Configuración y Vista Previa - {exportFormat?.toUpperCase()}</span>
                            <Chip color="default" variant="flat" className="text-white">
                                {selectedSections.length} secciones
                            </Chip>
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-0">
                        <div className="grid grid-cols-12 gap-0 min-h-[70vh]">
                            {/* Left Panel - Configuration */}
                            <div className="col-span-4 border-r border-gray-200 p-6 bg-gray-50">
                                <h3 className="text-lg font-bold mb-4">Configurar Secciones</h3>
                                <CheckboxGroup value={selectedSections} onValueChange={setSelectedSections}>
                                    <div className="space-y-3">
                                        {sections.map((section) => (
                                            <Checkbox key={section.key} value={section.key} color="success" size="lg">
                                                <span className="font-medium">{section.label}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </CheckboxGroup>

                                <Divider className="my-6" />

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-800 mb-2">
                                        Formato: {exportFormat?.toUpperCase()}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        {exportFormat === 'excel' && 'Archivo Excel con datos tabulados'}
                                        {exportFormat === 'csv' && 'Archivo CSV compatible con Excel'}
                                        {exportFormat === 'pdf' && 'Documento PDF listo para imprimir'}
                                    </p>
                                </div>
                            </div>

                            {/* Right Panel - Live Preview */}
                            <div className="col-span-8 p-6 overflow-auto">
                                <h3 className="text-lg font-bold mb-4">Vista Previa en Tiempo Real</h3>
                                {reporteCompleto && (
                                    <FormatPreview
                                        data={reporteCompleto}
                                        selectedSections={selectedSections}
                                        cultivoNombre={cultivos.find((c) => c.id === cultivoId)?.nombre}
                                        format={exportFormat || 'pdf'}
                                        iotData={previewIotData}
                                    />
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-gray-50 border-t">
                        <Button variant="light" onPress={() => setIsPreviewOpen(false)} size="lg">
                            Cancelar
                        </Button>
                        <Button
                            color="success"
                            startContent={<Download className="h-4 w-4" />}
                            onPress={handleConfirmExport}
                            size="lg"
                            className="font-semibold"
                        >
                            Exportar {exportFormat?.toUpperCase()}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Loading */}
            {isLoading && (
                <Card>
                    <CardBody className="text-center py-12">
                        <div className="animate-pulse">
                            <Package className="h-16 w-16 mx-auto text-primary-400 mb-4" />
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
