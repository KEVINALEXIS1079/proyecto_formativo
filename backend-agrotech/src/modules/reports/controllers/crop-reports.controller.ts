import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CropReportsService } from '../services/crop-reports.service';

@Controller('reports/crops')
export class CropReportsController {
  constructor(private readonly cropService: CropReportsService) {}

  @Get(':id/summary')
  async getCropSummary(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getCropSummary(id);
  }

  @Get(':id/activities')
  async getActivityStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getActivityStats(id);
  }

  @Get(':id/labor')
  async getLaborStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getLaborStats(id);
  }

  @Get(':id/inputs')
  async getInputStats(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.getInputStats(id);
  }

  @Get(':id/consistency')
  async validateConsistency(@Param('id', ParseIntPipe) id: number) {
    return this.cropService.validateConsistency(id);
  }
}
