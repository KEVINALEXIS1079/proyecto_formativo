import { Controller, Get, Query, Param, ParseIntPipe, UseGuards, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { FinancialReportsService } from '../services/financial-reports.service';
import { ExportService } from '../../../common/services/export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('reports/financial')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinancialReportsController {
  constructor(
    private readonly financialService: FinancialReportsService,
    private readonly exportService: ExportService,
  ) {}

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

  @Get('rentability/lote/:loteId')
  // @RequirePermissions('cultivos.ver', 'ventas.ver')
  async getLoteRentability(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.financialService.getLoteRentability(loteId);
  }

  @Get('rentability/sublote/:subLoteId')
  // @RequirePermissions('cultivos.ver', 'ventas.ver')
  async getSubLoteRentability(@Param('subLoteId', ParseIntPipe) subLoteId: number) {
    return this.financialService.getSubLoteRentability(subLoteId);
  }

  @Get('crop-summary/:cultivoId')
  // @RequirePermissions('cultivos.ver', 'ventas.ver')
  async getCropSummary(@Param('cultivoId', ParseIntPipe) cultivoId: number) {
    return this.financialService.getCropSummary(cultivoId);
  }

  // Exportar reportes financieros a CSV/XLS
  @Get('export')
  @RequirePermissions('reportes.ver')
  async exportFinancialReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clienteId') clienteId?: string,
    @Query('productoAgroId') productoAgroId?: string,
    @Query('cultivoId') cultivoId?: string,
    @Query('format') format?: 'csv' | 'xlsx',
    @Res({ passthrough: false }) res?: Response,
  ) {
    const data = await this.financialService.getSalesReport({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      clienteId: clienteId ? parseInt(clienteId) : undefined,
      productoAgroId: productoAgroId ? parseInt(productoAgroId) : undefined,
      cultivoId: cultivoId ? parseInt(cultivoId) : undefined,
    });

    const fileFormat = format || 'xlsx';
    const dateStr = new Date().toISOString().split('T')[0];
    let buffer: Buffer | string;
    let contentType: string;
    let filename: string;

    if (fileFormat === 'csv') {
      buffer = await this.exportService.exportToCSV(data.data);
      contentType = 'text/csv';
      filename = `reportes-financieros-${dateStr}.csv`;
    } else {
      buffer = await this.exportService.exportToExcel(data.data, 'Reportes Financieros');
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `reportes-financieros-${dateStr}.xlsx`;
    }

    res?.setHeader('Content-Type', contentType);
    res?.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res?.status(HttpStatus.OK).send(buffer);
  }
}
