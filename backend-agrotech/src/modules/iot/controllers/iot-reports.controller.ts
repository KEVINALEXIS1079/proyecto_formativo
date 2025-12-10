import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { IotReportsService } from '../services/iot-reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('api/v1/iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotReportsController {
  constructor(private readonly reportsService: IotReportsService) {}

  @Get('reports/general')
  @RequirePermissions('iot.ver')
  getGeneralReport(
    @Query('loteId') loteId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sensorId') sensorId?: string,
  ) {
    return this.reportsService.getGeneralReport({
      loteId: loteId ? parseInt(loteId) : undefined,
      startDate,
      endDate,
      sensorId: sensorId ? parseInt(sensorId) : undefined,
    });
  }

  @Get('comparison')
  @RequirePermissions('iot.ver')
  getComparison(
    @Query('loteIds') loteIds?: string,
    @Query('tipoSensorId') tipoSensorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedLoteIds = (loteIds || '')
      .split(',')
      .map((id) => parseInt(id))
      .filter((n) => !isNaN(n));

    return this.reportsService.getComparison({
      loteIds: parsedLoteIds,
      tipoSensorId: tipoSensorId ? parseInt(tipoSensorId) : undefined,
      startDate,
      endDate,
    });
  }

  @Get('sensors/:id/lecturas')
  @RequirePermissions('iot.ver')
  getSensorLecturas(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(100)) limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSensorLecturas(id, {
      limit: Number(limit),
      startDate,
      endDate,
    });
  }

  @Get('analytics/lot')
  @RequirePermissions('iot.ver')
  getLotAnalytics(
    @Query('loteId', ParseIntPipe) loteId: number,
    @Query('subLoteId') subLoteId?: string,
    @Query('sensorId') sensorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getLotAnalytics({
      loteId,
      subLoteId: subLoteId ? parseInt(subLoteId) : undefined,
      sensorId: sensorId ? parseInt(sensorId) : undefined,
      startDate,
      endDate,
    });
  }
}
