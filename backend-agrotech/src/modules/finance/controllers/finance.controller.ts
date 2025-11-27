import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from '../services/finance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('transactions')
  @RequirePermissions('finanzas.ver')
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('actividadId') actividadId?: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const filters: any = {};

    if (tipo) filters.tipo = tipo;
    if (categoria) filters.categoria = categoria;
    if (actividadId) filters.actividadId = Number(actividadId);
    if (fechaInicio) filters.fechaInicio = new Date(fechaInicio);
    if (fechaFin) filters.fechaFin = new Date(fechaFin);

    return this.financeService.findAll(filters);
  }

  @Get('summary')
  @RequirePermissions('finanzas.ver')
  async getResumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const filters: any = {};

    if (fechaInicio) filters.fechaInicio = new Date(fechaInicio);
    if (fechaFin) filters.fechaFin = new Date(fechaFin);

    return this.financeService.getResumenFinanciero(filters);
  }

  @Get('by-activity/:id')
  @RequirePermissions('finanzas.ver')
  async findByActividad(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.findByActividad(id);
  }

  @Get('transactions/:id')
  @RequirePermissions('finanzas.ver')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.findOne(id);
  }
}
