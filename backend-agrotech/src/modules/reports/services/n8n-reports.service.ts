import { Injectable } from '@nestjs/common';
import { ActivitiesService } from '../../activities/services/activities.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

@Injectable()
export class N8nReportsService {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Genera un reporte PDF del historial de actividades en formato tabla
   */
  async generateActivitiesPdf(filters?: {
    cultivoId?: number;
    loteId?: number;
    tipo?: string;
  }): Promise<Buffer> {
    const actividades = await this.activitiesService.findAll(filters);

    const doc = new PDFDocument({
      margin: 30,
      size: 'A3',
      layout: 'landscape',
    });

    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // -------------------------------
    //        ENCABEZADO
    // -------------------------------
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Historial de Actividades Agrícolas', { align: 'center' });

    doc.moveDown();

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#374151') // gris-700
      .text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, {
        align: 'left',
      });

    doc.text(`Total de actividades registradas: ${actividades.length}`, {
      align: 'left',
    });

    doc.moveDown(2); // espacio antes de la tabla

    // -------------------------------
    //      CONFIG TABLA
    // -------------------------------
    const tableTop = doc.y;

    // Ajuste: primera columna más ancha
    const colWidths = [
      110, // Nombre Actividad (Más grande)
      90, // Descripción
      55, // Lote
      55, // Sublote
      55, // Cultivo
      75, // Creador
      40, // N° Resp
      35, // Hrs
      45, // MO $/h
      50, // Total MO
      70, // Insumos
      50, // Tot. Ins
      70, // Servicios
      50, // Tot. Serv
      55, // Total Act
      45, // Fecha
    ];

    const headers = [
      'Nombre Actividad',
      'Descripción',
      'Lote',
      'Sublote',
      'Cultivo',
      'Creador',
      'N° Resp',
      'Hrs',
      'MO $/h',
      'Total MO',
      'Insumos',
      'Tot. Ins',
      'Servicios',
      'Tot. Serv',
      'Total Act',
      'Fecha',
    ];

    let currentX = 30;
    let currentY = tableTop;

    // -------------------------------
    //      ENCABEZADOS DE TABLA
    // -------------------------------
    doc.fontSize(8).font('Helvetica-Bold');

    headers.forEach((header, i) => {
      doc
        .rect(currentX, currentY, colWidths[i], 26)
        .fill('#22c55e') // verde-500 HeroUI
        .stroke('#16a34a'); // verde-600 (borde leve)

      doc
        .fillColor('#ffffff') // blanco
        .text(header, currentX + 5, currentY + 8, {
          width: colWidths[i] - 10,
          align: 'center',
        });

      currentX += colWidths[i];
    });

    currentY += 26;

    // -------------------------------
    //         FILAS DE DATOS
    // -------------------------------
    actividades.forEach((act, index) => {
      const rowHeight = 38;
      currentX = 30;

      // Nueva página si se llena el espacio
      if (currentY + rowHeight > 750) {
        doc.addPage({ size: 'A3', layout: 'landscape', margin: 30 });
        currentY = 30;

        // Redibujar encabezados
        currentX = 30;
        doc.fontSize(8).font('Helvetica-Bold');

        headers.forEach((header, i) => {
          doc
            .rect(currentX, currentY, colWidths[i], 26)
            .fill('#22c55e')
            .stroke('#16a34a');

          doc.fillColor('#ffffff').text(header, currentX + 5, currentY + 8, {
            width: colWidths[i] - 10,
            align: 'center',
          });

          currentX += colWidths[i];
        });

        currentY += 26;
      }

      const bg = index % 2 === 0 ? '#ffffff' : '#f9fafb'; // blanco / gris-50

      const totalInsumos =
        act.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0;

      const totalServicios =
        act.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0;

      const totalActividad = act.costoManoObra + totalInsumos + totalServicios;

      const rowData = [
        `${act.nombre}\n(${act.tipo} • ${act.subtipo})`,
        act.descripcion || 'Sin descripción',
        act.lote?.nombre || 'N/A',
        act.subLote?.nombre || 'N/A',
        act.cultivo?.nombreCultivo || 'N/A',
        act.creadoPorUsuario
          ? `${act.creadoPorUsuario.nombre} ${act.creadoPorUsuario.apellido}`
          : 'N/A',
        (act.responsables?.length || 0).toString(),
        `${act.horasActividad} hrs`,
        `$${act.precioHoraActividad.toLocaleString('es-CO')}`,
        `$${act.costoManoObra.toLocaleString('es-CO')}`,
        act.insumosUso?.map((i) => i.insumo?.nombre).join(', ') || 'N/A',
        `$${totalInsumos.toLocaleString('es-CO')}`,
        act.servicios?.map((s) => s.nombreServicio).join(', ') || 'N/A',
        `$${totalServicios.toLocaleString('es-CO')}`,
        `$${totalActividad.toLocaleString('es-CO')}`,
        new Date(act.fecha).toLocaleDateString('es-CO'),
      ];

      doc.fontSize(7).font('Helvetica');

      rowData.forEach((data, i) => {
        // Fondo alternado
        doc
          .rect(currentX, currentY, colWidths[i], rowHeight)
          .fill(bg)
          .stroke('#e5e7eb'); // gray-200

        // Texto
        doc.fillColor('#000000').text(data, currentX + 5, currentY + 5, {
          width: colWidths[i] - 10,
          align: 'left',
          ellipsis: true,
        });

        currentX += colWidths[i];
      });

      currentY += rowHeight;
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Genera un reporte Excel del historial de actividades
   */
  async generateActivitiesExcel(filters?: {
    cultivoId?: number;
    loteId?: number;
    tipo?: string;
  }): Promise<Buffer> {
    const actividades = await this.activitiesService.findAll(filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Actividades');

    // Configurar columnas (igual que el frontend)
    worksheet.columns = [
      { header: 'Nombre Actividad', key: 'nombre', width: 25 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Lote', key: 'lote', width: 20 },
      { header: 'Sublote', key: 'sublote', width: 20 },
      { header: 'Cultivo', key: 'cultivo', width: 20 },
      { header: 'Creador', key: 'creador', width: 25 },
      { header: 'N° Responsables', key: 'numResponsables', width: 15 },
      { header: 'Horas', key: 'horas', width: 10 },
      { header: 'Valor MO ($/h)', key: 'valorMO', width: 15 },
      { header: 'Total MO', key: 'totalMO', width: 15 },
      { header: 'Insumos', key: 'insumos', width: 30 },
      { header: 'Cantidad', key: 'cantidadInsumos', width: 15 },
      { header: 'Valor Insumos', key: 'valorInsumos', width: 15 },
      { header: 'Total Insumos', key: 'totalInsumos', width: 15 },
      { header: 'Servicios', key: 'servicios', width: 30 },
      { header: 'Horas Servicio', key: 'horasServicio', width: 15 },
      { header: 'Valor Servicio', key: 'valorServicio', width: 15 },
      { header: 'Total Servicios', key: 'totalServicios', width: 15 },
      { header: 'Total Actividad', key: 'totalActividad', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 15 },
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2c3e50' },
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Agregar datos
    actividades.forEach((act) => {
      const lote = act.lote?.nombre || 'N/A';
      const sublote = act.subLote?.nombre || 'N/A';
      const cultivo = act.cultivo?.nombreCultivo || 'N/A';
      const creador = act.creadoPorUsuario
        ? `${act.creadoPorUsuario.nombre} ${act.creadoPorUsuario.apellido}\n${act.creadoPorUsuario.identificacion || ''}`
        : 'N/A';

      const numResponsables = act.responsables?.length || 0;

      // Insumos (igual que frontend)
      const insumosNombres =
        act.insumosUso?.map((i) => i.insumo?.nombre || 'N/A').join(', ') ||
        'N/A';
      const insumosCantidades =
        act.insumosUso
          ?.map((i) => `${i.cantidadUso} ${i.insumo?.unidadUso || 'unid'}`)
          .join(', ') || 'N/A';
      const insumosValores =
        act.insumosUso
          ?.map((i) => `$${i.costoTotal.toLocaleString('es-CO')}`)
          .join(', ') || 'N/A';
      const totalInsumos =
        act.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0;

      // Servicios (igual que frontend)
      const serviciosNombres =
        act.servicios?.map((s) => s.nombreServicio).join(', ') || 'N/A';
      const serviciosHoras =
        act.servicios?.map((s) => `${s.horas} hrs`).join(', ') || 'N/A';
      const serviciosValores =
        act.servicios
          ?.map((s) => `$${s.precioHora.toLocaleString('es-CO')}`)
          .join(', ') || 'N/A';
      const totalServicios =
        act.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0;

      const totalActividad = act.costoManoObra + totalInsumos + totalServicios;

      worksheet.addRow({
        nombre: `${act.nombre}\n\n${act.tipo}\n${act.subtipo}`,
        descripcion: act.descripcion || 'Sin descripción',
        lote,
        sublote,
        cultivo,
        creador,
        numResponsables,
        horas: `${act.horasActividad} hrs`,
        valorMO: `$ ${act.precioHoraActividad.toLocaleString('es-CO')}`,
        totalMO: `$ ${act.costoManoObra.toLocaleString('es-CO')}`,
        insumos: insumosNombres,
        cantidadInsumos: insumosCantidades,
        valorInsumos: insumosValores,
        totalInsumos: `$ ${totalInsumos.toLocaleString('es-CO')}`,
        servicios: serviciosNombres,
        horasServicio: serviciosHoras,
        valorServicio: serviciosValores,
        totalServicios: `$ ${totalServicios.toLocaleString('es-CO')}`,
        totalActividad: `$ ${totalActividad.toLocaleString('es-CO')}`,
        fecha: new Date(act.fecha).toLocaleDateString('es-CO'),
      });
    });

    // Ajustar altura de filas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 60;
        row.alignment = { vertical: 'top', wrapText: true };
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
