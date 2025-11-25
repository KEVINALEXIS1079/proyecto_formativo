import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GeoService } from '../services/geo.service';
import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { CreateSubLoteDto } from '../dtos/create-sublote.dto';
import { UpdateSubLoteDto } from '../dtos/update-sublote.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('geo')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // ==================== LOTES ====================

  @Post('lotes')
  @RequirePermissions('geo.crear')
  @UsePipes(new ValidationPipe())
  async createLote(@Body() dto: CreateLoteDto) {
    return this.geoService.createLote(dto);
  }

  @Get('lotes')
  @RequirePermissions('geo.ver')
  async findAllLotes() {
    return this.geoService.findAllLotes();
  }

  @Get('lotes/:id')
  @RequirePermissions('geo.ver')
  async findLoteById(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.findLoteById(id);
  }

  @Patch('lotes/:id')
  @RequirePermissions('geo.editar')
  @UsePipes(new ValidationPipe())
  async updateLote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLoteDto,
  ) {
    return this.geoService.updateLote(id, dto);
  }

  @Delete('lotes/:id')
  @RequirePermissions('geo.eliminar')
  async removeLote(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.removeLote(id);
  }

  // ==================== SUBLOTES ====================

  @Post('sublotes')
  @RequirePermissions('geo.crear')
  @UsePipes(new ValidationPipe())
  async createSubLote(@Body() dto: CreateSubLoteDto) {
    return this.geoService.createSubLote(dto);
  }

  @Get('sublotes')
  @RequirePermissions('geo.ver')
  async findAllSubLotes(@Query('loteId') loteId?: string) {
    return this.geoService.findAllSubLotes(loteId ? parseInt(loteId) : undefined);
  }

  @Get('sublotes/:id')
  @RequirePermissions('geo.ver')
  async findSubLoteById(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.findSubLoteById(id);
  }

  @Patch('sublotes/:id')
  @RequirePermissions('geo.editar')
  @UsePipes(new ValidationPipe())
  async updateSubLote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubLoteDto,
  ) {
    return this.geoService.updateSubLote(id, dto);
  }

  @Delete('sublotes/:id')
  @RequirePermissions('geo.eliminar')
  async removeSubLote(@Param('id', ParseIntPipe) id: number) {
    return this.geoService.removeSubLote(id);
  }
}
