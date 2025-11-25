import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { GeoService } from '../services/geo.service';
import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { CreateSubLoteDto } from '../dtos/create-sublote.dto';
import { UpdateSubLoteDto } from '../dtos/update-sublote.dto';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('geo')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // ==================== HTTP ENDPOINTS ====================

  // ==================== CULTIVOS ====================

  @Post('cultivos')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivoHttp(@Body() dto: CreateCultivoDto) {
    return this.createCultivo(dto);
  }

  @Get('cultivos')
  @RequirePermissions('cultivos.ver')
  async findAllCultivosHttp() {
    return this.findAllCultivos();
  }

  @Get('cultivos/:id')
  @RequirePermissions('cultivos.ver')
  async findOneCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findCultivoById(id);
  }

  @Patch('cultivos/:id')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivoHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCultivoDto) {
    return this.updateCultivo(id, dto);
  }

  @Delete('cultivos/:id')
  @RequirePermissions('cultivos.eliminar')
  async removeCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeCultivo(id);
  }

  // ==================== LOTES ====================

  @Post('lotes')
  @RequirePermissions('lotes.crear')
  @UsePipes(new ValidationPipe())
  async createLoteHttp(@Body() dto: CreateLoteDto) {
    return this.createLote(dto);
  }

  @Get('lotes')
  @RequirePermissions('lotes.ver')
  async findAllLotesHttp() {
    return this.findAllLotes();
  }

  @Get('lotes/:id')
  @RequirePermissions('lotes.ver')
  async findOneLoteHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findLoteById(id);
  }

  @Patch('lotes/:id')
  @RequirePermissions('lotes.editar')
  @UsePipes(new ValidationPipe())
  async updateLoteHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoteDto) {
    return this.updateLote(id, dto);
  }

  @Delete('lotes/:id')
  @RequirePermissions('lotes.eliminar')
  async removeLoteHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeLote(id);
  }

  // ==================== SUBLOTES ====================

  @Post('sublotes')
  @RequirePermissions('sublotes.crear')
  @UsePipes(new ValidationPipe())
  async createSubLoteHttp(@Body() dto: CreateSubLoteDto) {
    return this.createSubLote(dto);
  }

  @Get('sublotes')
  @RequirePermissions('sublotes.ver')
  async findAllSubLotesHttp(@Query('loteId') loteId?: number) {
    return this.findAllSubLotes(loteId);
  }

  @Get('sublotes/:id')
  @RequirePermissions('sublotes.ver')
  async findOneSubLoteHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findSubLoteById(id);
  }

  @Patch('sublotes/:id')
  @RequirePermissions('sublotes.editar')
  @UsePipes(new ValidationPipe())
  async updateSubLoteHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubLoteDto) {
    return this.updateSubLote(id, dto);
  }

  @Delete('sublotes/:id')
  @RequirePermissions('sublotes.eliminar')
  async removeSubLoteHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeSubLote(id);
  }

  // ==================== INTERNAL METHODS ====================

  // ==================== LOTES ====================

  // Internal method for WebSocket: handles finding all lotes by calling the service
  // Flow: Gateway calls this method -> calls geoService.findAllLotes -> returns lotes list
  async findAllLotes() {
    return this.geoService.findAllLotes();
  }

  // Internal method for WebSocket: handles finding a lote by ID by calling the service
  // Flow: Gateway calls this method -> calls geoService.findLoteById -> returns lote
  async findLoteById(id: number) {
    return this.geoService.findLoteById(id);
  }

  // Internal method for WebSocket: handles creating a lote by calling the service
  // Flow: Gateway calls this method -> calls geoService.createLote -> returns created lote
  @UsePipes(new ValidationPipe())
  async createLote(createLoteDto: CreateLoteDto) {
    return this.geoService.createLote(createLoteDto);
  }

  // Internal method for WebSocket: handles updating a lote by calling the service
  // Flow: Gateway calls this method -> calls geoService.updateLote -> returns updated lote
  @UsePipes(new ValidationPipe())
  async updateLote(id: number, data: UpdateLoteDto) {
    return this.geoService.updateLote(id, data);
  }

  // Internal method for WebSocket: handles removing a lote by calling the service
  // Flow: Gateway calls this method -> calls geoService.removeLote -> returns removed lote
  async removeLote(id: number) {
    return this.geoService.removeLote(id);
  }

  // ==================== SUBLOTES ====================

  // Internal method for WebSocket: handles finding all sublotes with optional loteId filter by calling the service
  // Flow: Gateway calls this method -> calls geoService.findAllSubLotes -> returns sublotes list
  async findAllSubLotes(loteId?: number) {
    return this.geoService.findAllSubLotes(loteId);
  }

  // Internal method for WebSocket: handles finding a sublote by ID by calling the service
  // Flow: Gateway calls this method -> calls geoService.findSubLoteById -> returns sublote
  async findSubLoteById(id: number) {
    return this.geoService.findSubLoteById(id);
  }

  // Internal method for WebSocket: handles creating a sublote by calling the service
  // Flow: Gateway calls this method -> calls geoService.createSubLote -> returns created sublote
  @UsePipes(new ValidationPipe())
  async createSubLote(createSubLoteDto: CreateSubLoteDto) {
    return this.geoService.createSubLote(createSubLoteDto);
  }

  // Internal method for WebSocket: handles updating a sublote by calling the service
  // Flow: Gateway calls this method -> calls geoService.updateSubLote -> returns updated sublote
  @UsePipes(new ValidationPipe())
  async updateSubLote(id: number, data: UpdateSubLoteDto) {
    return this.geoService.updateSubLote(id, data);
  }

  // Internal method for WebSocket: handles removing a sublote by calling the service
  // Flow: Gateway calls this method -> calls geoService.removeSubLote -> returns removed sublote
  async removeSubLote(id: number) {
    return this.geoService.removeSubLote(id);
  }

  // ==================== CULTIVOS ====================

  // Internal method for WebSocket: handles finding all cultivos with filters by calling the service
  // Flow: Gateway calls this method -> calls geoService.findAllCultivos -> returns cultivos list
  async findAllCultivos(filters?: any) {
    return this.geoService.findAllCultivos(filters);
  }

  // Internal method for WebSocket: handles finding a cultivo by ID by calling the service
  // Flow: Gateway calls this method -> calls geoService.findCultivoById -> returns cultivo
  async findCultivoById(id: number) {
    return this.geoService.findCultivoById(id);
  }

  // Internal method for WebSocket: handles creating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls geoService.createCultivo -> returns created cultivo
  @UsePipes(new ValidationPipe())
  async createCultivo(createCultivoDto: CreateCultivoDto) {
    return this.geoService.createCultivo(createCultivoDto);
  }

  // Internal method for WebSocket: handles updating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls geoService.updateCultivo -> returns updated cultivo
  @UsePipes(new ValidationPipe())
  async updateCultivo(id: number, data: UpdateCultivoDto) {
    return this.geoService.updateCultivo(id, data);
  }

  // Internal method for WebSocket: handles removing a cultivo by calling the service
  // Flow: Gateway calls this method -> calls geoService.removeCultivo -> returns removed cultivo
  async removeCultivo(id: number) {
    return this.geoService.removeCultivo(id);
  }
}
