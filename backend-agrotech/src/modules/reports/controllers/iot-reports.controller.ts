import { Controller, Get, Param, Query, ParseIntPipe, Res, HttpStatus, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { IotReportsService } from '../services/iot-reports.service';
import { ExportService } from '../../../common/services/export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('reports/iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotReportsController {
  constructor(
    private readonly iotService: IotReportsService,
    private readonly exportService: ExportService,
  ) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.iotService.getDashboardStats();
  }

  @Get('aggregations')
  async getAggregations(
    @Query('sensorId') sensorId?: string,
    @Query('cultivoId') cultivoId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('interval') interval?: 'hour' | 'day' | 'week',
  ) {
    return this.iotService.getSensorAggregations({
      sensorId: sensorId ? parseInt(sensorId) : undefined,
      cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      interval,
    });
  }

  @Get('sensors/:id/out-of-range')
  async getOutOfRangeStats(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getOutOfRangeStats(id);
  }

  @Get('sensors/:id/uptime')
  async getUptimeStats(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getUptimeStats(id);
  }

  @Get('sensors/:id/sparkline')
  async getSparkline(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string
  ) {
    return this.iotService.getSparkline(id, limit ? parseInt(limit) : 20);
  }

  // RF50: Comparativa de sensores (ranking por métricas)
  @Get('sensors/compare')
  async compareSensors(
    @Query('tipoSensorId') tipoSensorId?: string,
    @Query('cultivoId') cultivoId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('metric') metric?: 'avg' | 'max' | 'min',
    @Query('limit') limit?: string,
  ) {
    return this.iotService.compareSensors({
      tipoSensorId: tipoSensorId ? parseInt(tipoSensorId) : undefined,
      cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      metric: metric || 'avg',
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // RF51: Exportar datos IoT a CSV/XLS
   @Get('export')
   @RequirePermissions('reportes.ver')
   async exportData(
     @Query('sensorId') sensorId?: string,
     @Query('cultivoId') cultivoId?: string,
     @Query('from') from?: string,
     @Query('to') to?: string,
     @Query('interval') interval?: 'hour' | 'day' | 'week',
     @Query('format') format?: 'csv' | 'xlsx',
     @Res({ passthrough: false }) res?: Response,
   ) {
     const data = await this.iotService.getSensorAggregations({
       sensorId: sensorId ? parseInt(sensorId) : undefined,
       cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
       from: from ? new Date(from) : undefined,
       to: to ? new Date(to) : undefined,
       interval,
     });

     const fileFormat = format || 'xlsx';
     const dateStr = new Date().toISOString().split('T')[0];
     let buffer: Buffer | string;
     let contentType: string;
     let filename: string;

     if (fileFormat === 'csv') {
       buffer = await this.exportService.exportToCSV(data);
       contentType = 'text/csv';
       filename = `reporte-iot-${dateStr}.csv`;
     } else {
       buffer = await this.exportService.exportToExcel(data, 'Reportes IoT');
       contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
       filename = `reporte-iot-${dateStr}.xlsx`;
     }

     res?.setHeader('Content-Type', contentType);
     res?.setHeader('Content-Disposition', `attachment; filename=${filename}`);
     res?.status(HttpStatus.OK).send(buffer);
   }
}
