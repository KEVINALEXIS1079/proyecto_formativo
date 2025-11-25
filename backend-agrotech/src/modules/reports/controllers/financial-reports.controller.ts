import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FinancialReportsService } from '../services/financial-reports.service';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../../../common/guards/permissions.guard';
// import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@Controller('reports/financial')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinancialReportsController {
  constructor(private readonly financialService: FinancialReportsService) {}

  @Get('sales')
  // @RequirePermissions('ventas.ver')
  async getSalesReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clienteId') clienteId?: string,
    @Query('productoAgroId') productoAgroId?: string,
    @Query('cultivoId') cultivoId?: string,
  ) {
    return this.financialService.getSalesReport({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      clienteId: clienteId ? parseInt(clienteId) : undefined,
      productoAgroId: productoAgroId ? parseInt(productoAgroId) : undefined,
      cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
    });
  }

  @Get('prices')
  // @RequirePermissions('ventas.ver')
  async getHistoricalPrices(
    @Query('productoAgroId', ParseIntPipe) productoAgroId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('cultivoId') cultivoId?: string,
  ) {
    return this.financialService.getHistoricalPrices({
      productoAgroId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
    });
  }

  @Get('rentability/:cultivoId')
  // @RequirePermissions('cultivos.ver', 'ventas.ver')
  async getCropRentability(@Param('cultivoId', ParseIntPipe) cultivoId: number) {
    return this.financialService.getCropRentability(cultivoId);
  }
}
