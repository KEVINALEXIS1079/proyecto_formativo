import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { IotReportsService } from '../services/iot-reports.service';

@Controller('reports/iot')
export class IotReportsController {
  constructor(private readonly iotService: IotReportsService) {}

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
}
