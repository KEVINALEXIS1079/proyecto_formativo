import { Controller, Get, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CropReportsService } from '../services/crop-reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('reports/crops')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CropReportsController {
  constructor(private readonly cropService: CropReportsService) {}

  @Get(':id/summary')
  @RequirePermissions('cultivos.ver')
  async getCropSummary(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getCropSummary(id);
  }

  @Get(':id/activities')
  @RequirePermissions('cultivos.ver')
  async getActivityStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getActivityStats(id);
  }

  @Get(':id/labor')
  @RequirePermissions('cultivos.ver')
  async getLaborStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getLaborStats(id);
  }

  @Get(':id/inputs')
  @RequirePermissions('cultivos.ver')
  async getInputStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getInputStats(id);
  }

  @Get(':id/hours-distribution')
  @RequirePermissions('cultivos.ver')
  async getHoursDistribution(@Param('id') id: string, @Query('granularity') granularity: 'day' | 'week' | 'month') {
    return this.cropService.getHoursByPeriod(+id, granularity);
  }

  @Get(':id/insumos-distribution')
  @RequirePermissions('cultivos.ver')
  async getInsumosDistribution(@Param('id') id: string, @Query('granularity') granularity: 'day' | 'week' | 'month') {
    return this.cropService.getInsumosByPeriod(+id, granularity);
  }

  @Get(':id/activities-detail')
  @RequirePermissions('cultivos.ver')
  async getActivityDetails(@Param('id') id: string) {
    return this.cropService.getActivityDetails(+id);
  }

  @Get(':id/export')
  @RequirePermissions('cultivos.ver')
  async exportCropHistory(@Param('id') id: string, @Query('type') type: 'summary' | 'activities' | 'insumos', @Res() res: Response) {
    const csv = await this.cropService.getCropHistoryCsv(+id, type || 'summary');
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=crop_${id}_${type || 'summary'}.csv`);
    res.send(csv);
  }

  @Get(':id/consistency')
  @RequirePermissions('cultivos.ver')
  async validateConsistency(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.validateConsistency(id);
  }
}
