import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IoTApi } from '../api/iot.api';
import { toast } from 'react-hot-toast';

interface UseIoTReportGeneratorProps {
  loteId?: number | null;
  startDate?: string;
  endDate?: string;
  sensorId?: number | null;
}

export const useIoTReportGenerator = () => {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const generatePdf = async ({ loteId, startDate, endDate, sensorId }: UseIoTReportGeneratorProps) => {
    try {
      setGeneratingPdf(true);
      
      // Load Logo
      const logoImg = new Image();
      logoImg.src = '/LogoTic.png';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      const data = await IoTApi.getGeneralReport({
        loteId: loteId || undefined,
        startDate,
        endDate,
        sensorId: sensorId || undefined
      });
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Choose report type based on loteId
      if (loteId) {
        generateSpecificReport(doc, data, logoImg, pageWidth, loteId, startDate, endDate);
      } else {
        generateGeneralReport(doc, data, logoImg, pageWidth, startDate, endDate);
      }

      doc.save(`reporte_iot_${loteId ? `lote${loteId}` : 'general'}_${endDate || 'actual'}.pdf`);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return { generatePdf, generatingPdf };
};

// SPECIFIC REPORT (for a single Lot)
function generateSpecificReport(doc: jsPDF, data: any, logoImg: HTMLImageElement, pageWidth: number, loteId: number, startDate?: string, endDate?: string) {
  // Background color for header
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Header with Logo
  try {
    doc.addImage(logoImg, 'PNG', 15, 8, 50, 20);
  } catch (e) {
    doc.setFontSize(16);
    doc.setTextColor(70, 130, 180);
    doc.text("TIC YAMBORO", 20, 20);
  }

  // Title with accent color
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 98, 255);
  doc.text(`REPORTE DE LOTE: ${loteId}`, pageWidth / 2, 20, { align: 'center' });
  
  // Period
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (startDate && endDate) {
    doc.text(`Periodo: ${startDate} - ${endDate}`, pageWidth / 2, 28, { align: 'center' });
  }
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, 34, { align: 'center' });
  doc.setTextColor(0);

  let yPos = 48;

  // RESUMEN DE SENSORES REGISTRADOS
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("RESUMEN DE SENSORES REGISTRADOS", 20, yPos);
  yPos += 7;

  doc.setFillColor(236, 240, 241);
  doc.setDrawColor(189, 195, 199);
  doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 62, 80);
  doc.text(`Sensores Activos: ${data.activos} de ${data.totalSensors}`, 25, yPos + 7);
  doc.text(`Tipo Principal: ${data.sensorsDetail[0]?.tipo || 'N/A'}`, 25, yPos + 13);
  yPos += 25;

  // ESTADISTICAS CLAVE
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("ESTADISTICAS CLAVE (Consolidado)", 20, yPos);
  yPos += 10;

  const cardW = 55;
  const cardH = 28;
  const cardGap = 7;
  const startX = (pageWidth - (cardW * 3 + cardGap * 2)) / 2;

  // Max Card
  doc.setFillColor(46, 204, 113);
  doc.roundedRect(startX, yPos, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("MAXIMO GLOBAL", startX + cardW/2, yPos + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.text(data.maxGlobal.toFixed(2), startX + cardW/2, yPos + 20, { align: 'center' });

  // Min Card
  doc.setFillColor(52, 152, 219);
  doc.roundedRect(startX + cardW + cardGap, yPos, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("MINIMO GLOBAL", startX + cardW + cardGap + cardW/2, yPos + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.text(data.minGlobal.toFixed(2), startX + cardW + cardGap + cardW/2, yPos + 20, { align: 'center' });

  // Avg Card
  doc.setFillColor(155, 89, 182);
  doc.roundedRect(startX + (cardW + cardGap) * 2, yPos, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("PROMEDIO", startX + (cardW + cardGap) * 2 + cardW/2, yPos + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.text(data.avgGlobal.toFixed(2), startX + (cardW + cardGap) * 2 + cardW/2, yPos + 20, { align: 'center' });

  yPos += cardH + 15;

  // Separator
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // HISTORIAL Y TENDENCIA POR SENSOR
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("HISTORIAL Y TENDENCIA POR SENSOR", 20, yPos);
  yPos += 10;

  // Group sensors by type
  const sensorsByType = new Map<string, any[]>();
  data.sensorsDetail.forEach((s: any) => {
    if (!sensorsByType.has(s.tipo)) {
      sensorsByType.set(s.tipo, []);
    }
    sensorsByType.get(s.tipo)?.push(s);
  });

  // Iterate through sensor types and draw charts
  sensorsByType.forEach((sensors, type) => {
    // Check page break
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(`Tipo: ${type}`, 20, yPos);
    yPos += 5;

    sensors.forEach((sensor: any) => {
      // Check page break
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      // Sensor Header with Stats
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 62, 80);
      doc.text(`${sensor.nombre} (ID: #${sensor.id})`, 20, yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const maxVal = sensor.max !== null ? sensor.max.toFixed(2) : 'N/A';
      const minVal = sensor.min !== null ? sensor.min.toFixed(2) : 'N/A';
      const unit = sensor.unidad || '';
      doc.text(`Max: ${maxVal}${unit} | Min: ${minVal}${unit} | Actual: ${sensor.ultimoValor}${unit}`, 20, yPos + 5);

      // Draw Chart for this sensor
      const sensorReadings = data.chartData.filter((d: any) => d.sensorId === sensor.id);
      
      if (sensorReadings.length > 1) {
        const chartX = 20;
        const chartY = yPos + 8;
        const chartW = pageWidth - 40;
        const chartH = 30;

        // Chart background
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(chartX, chartY, chartW, chartH, 1, 1, 'F');
        doc.setDrawColor(220);
        doc.roundedRect(chartX, chartY, chartW, chartH, 1, 1, 'D');

        // Find min/max for scaling
        const values = sensorReadings.map((d: any) => d.valor);
        const sMin = Math.min(...values);
        const sMax = Math.max(...values);
        const sRange = sMax - sMin || 1;

        // Draw line
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1);
        
        for (let i = 0; i < sensorReadings.length - 1; i++) {
          const x1 = chartX + 2 + (i / (sensorReadings.length - 1)) * (chartW - 4);
          const y1 = chartY + chartH - 2 - ((sensorReadings[i].valor - sMin) / sRange) * (chartH - 4);
          const x2 = chartX + 2 + ((i + 1) / (sensorReadings.length - 1)) * (chartW - 4);
          const y2 = chartY + chartH - 2 - ((sensorReadings[i + 1].valor - sMin) / sRange) * (chartH - 4);
          doc.line(x1, y1, x2, y2);
        }
        
        yPos += chartH + 15;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("(Insuficientes datos para graficar)", 20, yPos + 10);
        yPos += 15;
      }
    });
    
    yPos += 5; // Gap between types
  });

  // Separator
  doc.setDrawColor(189, 195, 199);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // DETALLE POR SENSOR (Table)
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("DETALLE POR SENSOR (Tabla)", 20, yPos);
  yPos += 5;

  if (data.sensorsDetail && data.sensorsDetail.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['ID', 'Nombre', 'Tipo', 'Max', 'Min', 'Ultimo', 'Estado']],
      body: data.sensorsDetail.map((s: any) => [
        `#${s.id}`,
        s.nombre,
        s.tipo,
        s.max !== null ? s.max.toFixed(2) : '-',
        s.min !== null ? s.min.toFixed(2) : '-',
        s.ultimoValor,
        s.estado === 'CONECTADO' ? 'Activo' : 'Inactivo'
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(149, 165, 166);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Reporte generado por AgroTech IoT System - ${new Date().toLocaleDateString('es-ES')} - Pagina ${i} de ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
  }
}

// GENERAL REPORT (all lots)
function generateGeneralReport(doc: jsPDF, data: any, logoImg: HTMLImageElement, pageWidth: number, startDate?: string, endDate?: string) {
  // Background color for header
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Header with Logo
  try {
    doc.addImage(logoImg, 'PNG', 15, 8, 50, 20);
  } catch (e) {
    doc.setFontSize(16);
    doc.setTextColor(70, 130, 180);
    doc.text("TIC YAMBORO", 20, 20);
  }

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 98, 255);
  doc.text("Reporte General de Estado", pageWidth - 20, 20, { align: 'right' });
  
  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth - 20, 28, { align: 'right' });
  if (startDate && endDate) {
    doc.text(`Periodo: ${startDate} - ${endDate}`, pageWidth - 20, 34, { align: 'right' });
  }
  doc.setTextColor(0);

  // SUMMARY CARDS with enhanced design
  const startY = 50;
  const cardWidth = 55;
  const cardHeight = 32;
  const gap = 7;
  const startX = (pageWidth - (cardWidth * 3 + gap * 2)) / 2;
  
  // Card 1: Total Sensores
  doc.setFillColor(52, 152, 219);
  doc.roundedRect(startX, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL SENSORES", startX + cardWidth/2, startY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.text(String(data.totalSensors), startX + cardWidth/2, startY + 24, { align: 'center' });

  // Card 2: Activos
  doc.setFillColor(46, 204, 113);
  doc.roundedRect(startX + cardWidth + gap, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("ACTIVOS", startX + cardWidth + gap + cardWidth/2, startY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.text(`${data.activos}`, startX + cardWidth + gap + cardWidth/2, startY + 20, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`(${data.porcentajeActivos}%)`, startX + cardWidth + gap + cardWidth/2, startY + 27, { align: 'center' });

  // Card 3: Alertas
  doc.setFillColor(231, 76, 60);
  doc.roundedRect(startX + (cardWidth + gap) * 2, startY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("ALERTAS", startX + (cardWidth + gap) * 2 + cardWidth/2, startY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.text(String(data.alertasActivas), startX + (cardWidth + gap) * 2 + cardWidth/2, startY + 24, { align: 'center' });

  // Separator
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(20, startY + cardHeight + 12, pageWidth - 20, startY + cardHeight + 12);

  // CHARTS SECTION
  const chartY = startY + cardHeight + 20;
  
  // Connection Status
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("ESTADO DE CONEXION", 20, chartY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Legend with icons
  doc.setFillColor(46, 204, 113);
  doc.circle(25, chartY + 8, 2, 'F');
  doc.setTextColor(44, 62, 80);
  doc.text(`Conectados: ${data.estados.conectados}`, 30, chartY + 9);
  
  doc.setFillColor(189, 195, 199);
  doc.circle(25, chartY + 15, 2, 'F');
  doc.text(`Desconectados: ${data.estados.desconectados}`, 30, chartY + 16);

  // Protocols
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("PROTOCOLOS", 100, chartY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const drawEnhancedBar = (label: string, value: number, y: number, color: number[]) => {
    const maxBarWidth = 60;
    const barWidth = Math.min((value / (data.totalSensors || 1)) * maxBarWidth, maxBarWidth);
    doc.setTextColor(44, 62, 80);
    doc.text(label, 100, y);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(120, y - 4, barWidth, 4, 1, 1, 'F');
    doc.setTextColor(52, 73, 94);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), 120 + barWidth + 3, y);
    doc.setFont('helvetica', 'normal');
  };

  let barY = chartY + 8;
  drawEnhancedBar("MQTT", data.protocolos.MQTT, barY, [52, 152, 219]);
  drawEnhancedBar("HTTP", data.protocolos.HTTP, barY + 8, [155, 89, 182]);
  drawEnhancedBar("WS", data.protocolos.WS, barY + 16, [241, 196, 15]);

  // Separator
  doc.setDrawColor(189, 195, 199);
  doc.line(20, barY + 28, pageWidth - 20, barY + 28);

  // RESUMEN POR LOTES
  if (data.lotesSummary && data.lotesSummary.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94);
    doc.text("RESUMEN POR LOTES", 20, barY + 38);
    
    autoTable(doc, {
      startY: barY + 43,
      head: [['Lote', 'Total Sensores', 'Activos', '% Activos']],
      body: data.lotesSummary.map((l: any) => [
        l.loteNombre,
        l.totalSensores,
        l.activos,
        `${Math.round((l.activos / l.totalSensores) * 100)}%`
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [52, 152, 219], 
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
  }

  const finalY = (doc as any).lastAutoTable?.finalY || (barY + 60);
  
  // AVERAGES
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text("PROMEDIOS POR TIPO DE SENSOR", 20, finalY + 12);

  const avgY = finalY + 20;
  const avgCardWidth = 42;
  const avgGap = 8;
  
  // Dynamic Cards with colors
  const colors = [
    [231, 76, 60],   // Red
    [52, 152, 219],  // Blue
    [46, 204, 113],  // Green
    [155, 89, 182],  // Purple
    [241, 196, 15]   // Yellow
  ];

  if (Array.isArray(data.promedios) && data.promedios.length > 0) {
    data.promedios.forEach((item: any, index: number) => {
      const x = 20 + (avgCardWidth + avgGap) * index;
      
      if (x + avgCardWidth < pageWidth - 20) {
        const color = colors[index % colors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, avgY, avgCardWidth, 22, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        const label = item.label.charAt(0).toUpperCase() + item.label.slice(1);
        doc.text(label, x + avgCardWidth/2, avgY + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`${item.value}`, x + avgCardWidth/2, avgY + 14, { align: 'center' });
        doc.setFontSize(7);
        doc.text(item.unit, x + avgCardWidth/2, avgY + 19, { align: 'center' });
      }
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(149, 165, 166);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Reporte generado por AgroTech IoT System - ${new Date().toLocaleDateString('es-ES')} - Pagina ${i} de ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
  }
}
