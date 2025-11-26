import { Controller, Get, Param, Query, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { IotReportsService } from '../services/iot-reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('reports/iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotReportsController {
  constructor(private readonly iotService: IotReportsService) {}

  @Get('dashboard')
  @RequirePermissions('iot.ver')
  async getDashboardStats() {
    return this.iotService.getDashboardStats();
  }

  @Get('aggregations')
  @RequirePermissions('iot.ver')
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

  @Get('comparison')
  @RequirePermissions('iot.ver')
  async getSensorComparison(@Query() query: any) {
    return this.iotService.getSensorComparison({
      tipoSensorId: query.tipoSensorId ? +query.tipoSensorId : undefined,
      cultivoId: query.cultivoId ? +query.cultivoId : undefined,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      metric: query.metric || 'avg',
      limit: query.limit ? +query.limit : 10
    });
  }

  @Get('export')
  @RequirePermissions('iot.ver')
  async exportIotReport(@Query() query: any, @Res() res: Response) {
    const type = query.type || 'aggregation';
    const filters = {
      sensorId: query.sensorId ? +query.sensorId : undefined,
      cultivoId: query.cultivoId ? +query.cultivoId : undefined,
      tipoSensorId: query.tipoSensorId ? +query.tipoSensorId : undefined,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      interval: query.interval,
      metric: query.metric || 'avg',
      limit: query.limit ? +query.limit : 10
    };
    
    const csv = await this.iotService.getIotReportCsv(type, filters);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=iot_${type}.csv`);
    res.send(csv);
  }

  @Get('sensors/:id/out-of-range')
  @RequirePermissions('iot.ver')
  async getOutOfRangeStats(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getOutOfRangeStats(id);
  }

  @Get('sensors/:id/uptime')
  @RequirePermissions('iot.ver')
  async getUptimeStats(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getUptimeStats(id);
  }

  @Get('sensors/:id/sparkline')
  @RequirePermissions('iot.ver')
  async getSparkline(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string
  ) {
    return this.iotService.getSparkline(id, limit ? parseInt(limit) : 20);
  }
}
