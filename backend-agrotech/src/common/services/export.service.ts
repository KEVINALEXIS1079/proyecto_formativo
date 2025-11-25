import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class ExportService {
  /**
   * RF51 & RF60: Exportar datos a Excel
   * @param data - Array de objetos a exportar
   * @param sheetName - Nombre de la hoja
   * @param filename - Nombre del archivo (sin extensión)
   * @returns Buffer del archivo Excel
   */
  async exportToExcel(data: any[], sheetName: string = 'Datos'): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) {
      return await workbook.xlsx.writeBuffer();
    }

    // Obtener las claves (columnas) del primer registro
    const keys = Object.keys(data[0]);
    
    // Agregar encabezados
    worksheet.columns = keys.map(key => ({
      header: this.formatHeader(key),
      key: key,
      width: 15,
    }));

    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Agregar datos
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Ajustar ancho de columnas automáticamente
    worksheet.columns.forEach(column => {
      if (column) {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exportar datos a CSV
   */
  async exportToCSV(data: any[]): Promise<string> {
    if (data.length === 0) {
      return '';
    }

    const keys = Object.keys(data[0]);
    const header = keys.map(k => this.formatHeader(k)).join(',');
    
    const rows = data.map(item => 
      keys.map(key => {
        const value = item[key];
        // Escapar valores con comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    return [header, ...rows].join('\n');
  }

  /**
   * Formatear nombre de columna (camelCase → Title Case)
   */
  private formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Generar QR Code como buffer
   * @param data - Datos para codificar en el QR
   * @returns Buffer del QR Code en formato PNG
   */
  async generateQRCode(data: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(data, {
        type: 'png',
        width: 200,
        margin: 2,
      });
    } catch (error) {
      throw new Error(`Error generando QR Code: ${error.message}`);
    }
  }

  /**
   * Generar PDF de factura
   * @param invoiceData - Datos de la factura
   * @returns Buffer del PDF
   */
  async generateInvoicePDF(invoiceData: {
    numero: string;
    fechaEmision: Date;
    vencimiento: Date;
    cliente: {
      nombre: string;
      identificacion?: string;
      direccion?: string;
    };
    detalles: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      precioTotal: number;
    }>;
    subtotal: number;
    impuestos: number;
    descuento: number;
    total: number;
    qrData?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Encabezado
        doc.fontSize(20).text('FACTURA', { align: 'center' });
        doc.moveDown();

        // Información de la factura
        doc.fontSize(12);
        doc.text(`Número: ${invoiceData.numero}`);
        doc.text(`Fecha de Emisión: ${invoiceData.fechaEmision.toLocaleDateString('es-CO')}`);
        doc.text(`Fecha de Vencimiento: ${invoiceData.vencimiento.toLocaleDateString('es-CO')}`);
        doc.moveDown();

        // Información del cliente
        doc.fontSize(14).text('Cliente:', { underline: true });
        doc.fontSize(12);
        doc.text(`Nombre: ${invoiceData.cliente.nombre}`);
        if (invoiceData.cliente.identificacion) {
          doc.text(`Identificación: ${invoiceData.cliente.identificacion}`);
        }
        if (invoiceData.cliente.direccion) {
          doc.text(`Dirección: ${invoiceData.cliente.direccion}`);
        }
        doc.moveDown();

        // Detalles de productos/servicios
        doc.fontSize(14).text('Detalles:', { underline: true });
        doc.moveDown(0.5);

        // Tabla de detalles
        const tableTop = doc.y;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 400;
        const totalX = 500;

        // Encabezados de tabla
        doc.fontSize(10);
        doc.text('Descripción', itemX, tableTop);
        doc.text('Cant.', qtyX, tableTop);
        doc.text('Precio Unit.', priceX, tableTop);
        doc.text('Total', totalX, tableTop);

        // Línea separadora
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let yPosition = tableTop + 25;

        // Filas de detalles
        invoiceData.detalles.forEach((detalle) => {
          doc.text(detalle.descripcion, itemX, yPosition);
          doc.text(detalle.cantidad.toString(), qtyX, yPosition);
          doc.text(`$${detalle.precioUnitario.toLocaleString('es-CO')}`, priceX, yPosition);
          doc.text(`$${detalle.precioTotal.toLocaleString('es-CO')}`, totalX, yPosition);
          yPosition += 20;
        });

        doc.moveDown(2);

        // Totales
        const totalesX = 400;
        doc.text(`Subtotal: $${invoiceData.subtotal.toLocaleString('es-CO')}`, totalesX, doc.y);
        doc.text(`Impuestos: $${invoiceData.impuestos.toLocaleString('es-CO')}`, totalesX, doc.y + 15);
        if (invoiceData.descuento > 0) {
          doc.text(`Descuento: $${invoiceData.descuento.toLocaleString('es-CO')}`, totalesX, doc.y + 30);
        }
        doc.fontSize(14).text(`Total: $${invoiceData.total.toLocaleString('es-CO')}`, totalesX, doc.y + 45);

        // QR Code si está disponible
        if (invoiceData.qrData) {
          doc.moveDown(2);
          doc.fontSize(12).text('Código QR de Validación:', { align: 'center' });
          doc.moveDown();

          // Generar QR y agregarlo al PDF
          QRCode.toBuffer(invoiceData.qrData, {
            type: 'png',
            width: 150,
            margin: 1,
          }).then((qrBuffer) => {
            doc.image(qrBuffer, 225, doc.y, { width: 150 });
            doc.end();
          }).catch((error) => {
            console.error('Error generando QR para PDF:', error);
            doc.end();
          });
        } else {
          doc.end();
        }

      } catch (error) {
        reject(new Error(`Error generando PDF: ${error.message}`));
      }
    });
  }
}
