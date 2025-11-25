import { Controller, Get, Param, Query, ParseIntPipe, Res, HttpStatus, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CropReportsService } from '../services/crop-reports.service';
import { ExportService } from '../../../common/services/export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('reports/crops')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CropReportsController {
  constructor(
    private readonly cropReportsService: CropReportsService,
    private readonly exportService: ExportService,
  ) {}

  @Get(':id/summary')
  @RequirePermissions('reportes.ver')
  async getCropSummary(@Param('id', ParseIntPipe) id: number) {
    return this.cropReportsService.getCropSummary(id);
  }

  @Get(':id/activities')
  @RequirePermissions('reportes.ver')
  async getActivityStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropReportsService.getActivityStats(id);
  }

  @Get(':id/labor')
  @RequirePermissions('reportes.ver')
  async getLaborStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropReportsService.getLaborStats(id);
  }

  @Get(':id/inputs')
  @RequirePermissions('reportes.ver')
  async getInputStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropReportsService.getInputStats(id);
  }

  @Get(':id/consistency')
  @RequirePermissions('reportes.ver')
  async validateConsistency(@Param('id', ParseIntPipe) id: number) {
    return this.cropReportsService.validateConsistency(id);
  }

  // RF54: Horas invertidas por periodo
  @Get(':id/labor-by-period')
  @RequirePermissions('reportes.ver')
  async getLaborByPeriod(
    @Param('id', ParseIntPipe) id: number,
    @Query('granularity') granularity?: 'day' | 'week' | 'month'
  ) {
    return this.cropReportsService.getLaborByPeriod(id, granularity);
  }

  // RF57: Consumo de insumos por periodo
  @Get(':id/inputs-by-period')
  @RequirePermissions('reportes.ver')
  async getInputConsumptionByPeriod(
    @Param('id', ParseIntPipe) id: number,
    @Query('granularity') granularity?: 'day' | 'week' | 'month'
  ) {
    return this.cropReportsService.getInputConsumptionByPeriod(id, granularity);
  }

  // RF58: Detalle de actividades con costos
  @Get(':id/detailed-activities')
  @RequirePermissions('reportes.ver')
  async getDetailedActivities(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.cropReportsService.getDetailedActivities(id, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  // RF59: Top insumos por costo/cantidad
  @Get(':id/top-inputs')
  @RequirePermissions('reportes.ver')
  async getTopInputs(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'costo' | 'cantidad'
  ) {
    return this.cropReportsService.getTopInputs(id, limit ? parseInt(limit) : 10, sortBy);
  }

  // RF60: Exportar historial de cultivo a Excel
  @Get(':id/export')
  @RequirePermissions('reportes.ver')
  async exportCropData(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: false }) res?: Response,
  ) {
    const [summary, activities, labor, inputs, detailedActivities] = await Promise.all([
      this.cropReportsService.getCropSummary(id),
      this.cropReportsService.getActivityStats(id),
      this.cropReportsService.getLaborStats(id),
      this.cropReportsService.getInputStats(id),
      this.cropReportsService.getDetailedActivities(id),
    ]);

    // Combinar todos los datos
    const combinedData = [
      { seccion: 'RESUMEN', ...summary.resumen },
      ...activities.map(a => ({ seccion: 'ACTIVIDADES', ...a })),
      ...labor.map(l => ({ seccion: 'MANO_DE_OBRA', ...l })),
      ...inputs.map(i => ({ seccion: 'INSUMOS', ...i })),
      ...detailedActivities.map(da => ({ seccion: 'DETALLE_ACTIVIDADES', ...da })),
    ];

    const buffer = await this.exportService.exportToExcel(
      combinedData,
      `Cultivo ${summary.cultivo.nombre}`,
    );

    res?.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res?.setHeader(
      'Content-Disposition',
      `attachment; filename=cultivo-${id}-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    res?.status(HttpStatus.OK).send(buffer);
  }

  // Exportar reportes de cultivos a CSV/XLS
  @Get('export')
  @RequirePermissions('reportes.ver')
  async exportCropsReport(
    @Query('cultivoId') cultivoId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('format') format?: 'csv' | 'xlsx',
    @Res({ passthrough: false }) res?: Response,
  ) {
    // Obtener cultivos filtrados
    const cultivos = await this.cropReportsService.getCultivosFiltered({
      id: cultivoId ? parseInt(cultivoId) : undefined,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
    });

    const allData = [];
    for (const cultivo of cultivos) {
      const [summary, activities, labor, inputs] = await Promise.all([
        this.cropReportsService.getCropSummary(cultivo.id),
        this.cropReportsService.getActivityStats(cultivo.id),
        this.cropReportsService.getLaborStats(cultivo.id),
        this.cropReportsService.getInputStats(cultivo.id),
      ]);

      allData.push(
        { cultivo: cultivo.nombreCultivo, seccion: 'RESUMEN', ...summary.resumen },
        ...activities.map(a => ({ cultivo: cultivo.nombreCultivo, seccion: 'ACTIVIDADES', ...a })),
        ...labor.map(l => ({ cultivo: cultivo.nombreCultivo, seccion: 'MANO_DE_OBRA', ...l })),
        ...inputs.map(i => ({ cultivo: cultivo.nombreCultivo, seccion: 'INSUMOS', ...i })),
      );
    }

    const fileFormat = format || 'xlsx';
    const dateStr = new Date().toISOString().split('T')[0];
    let buffer: Buffer | string;
    let contentType: string;
    let filename: string;

    if (fileFormat === 'csv') {
      buffer = await this.exportService.exportToCSV(allData);
      contentType = 'text/csv';
      filename = `reportes-cultivos-${dateStr}.csv`;
    } else {
      buffer = await this.exportService.exportToExcel(allData, 'Reportes Cultivos');
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `reportes-cultivos-${dateStr}.xlsx`;
    }

    res?.setHeader('Content-Type', contentType);
    res?.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res?.status(HttpStatus.OK).send(buffer);
  }
}
