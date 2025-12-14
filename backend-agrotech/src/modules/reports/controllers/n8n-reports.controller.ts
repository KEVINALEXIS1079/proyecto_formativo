import { Controller, Get, Res, Query } from '@nestjs/common';
import { N8nReportsService } from '../services/n8n-reports.service';
import type { Response } from 'express';

@Controller('reports/n8n')
export class N8nReportsController {
  constructor(private readonly n8nService: N8nReportsService) {}

  /**
   * Genera un reporte PDF del historial de actividades
   * GET /reports/n8n/activities/pdf?cultivoId=1&loteId=2&tipo=MANTENIMIENTO
   */
  @Get('activities/pdf')
  async generateActivitiesPdf(
    @Res() res: Response,
    @Query('cultivoId') cultivoId?: number,
    @Query('loteId') loteId?: number,
    @Query('tipo') tipo?: string,
  ) {
    const filters: any = {};
    if (cultivoId) filters.cultivoId = Number(cultivoId);
    if (loteId) filters.loteId = Number(loteId);
    if (tipo) filters.tipo = tipo;

    const pdfBuffer = await this.n8nService.generateActivitiesPdf(filters);

    const filename = `actividades_${new Date().toISOString().split('T')[0]}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Genera un reporte Excel del historial de actividades
   * GET /reports/n8n/activities/excel?cultivoId=1&loteId=2&tipo=MANTENIMIENTO
   */
  @Get('activities/excel')
  async generateActivitiesExcel(
    @Res() res: Response,
    @Query('cultivoId') cultivoId?: number,
    @Query('loteId') loteId?: number,
    @Query('tipo') tipo?: string,
  ) {
    const filters: any = {};
    if (cultivoId) filters.cultivoId = Number(cultivoId);
    if (loteId) filters.loteId = Number(loteId);
    if (tipo) filters.tipo = tipo;

    const excelBuffer = await this.n8nService.generateActivitiesExcel(filters);

    const filename = `actividades_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });

    res.send(excelBuffer);
  }
}
