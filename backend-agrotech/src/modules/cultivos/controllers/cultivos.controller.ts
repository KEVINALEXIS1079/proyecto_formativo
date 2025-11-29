import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { CultivosService } from '../services/cultivos.service';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('cultivos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  // ==================== HTTP ENDPOINTS ====================

  @Post()
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivoHttp(@Body() dto: CreateCultivoDto) {
    return this.createCultivo(dto);
  }

  @Get()
  @RequirePermissions('cultivos.ver')
  async findAllCultivosHttp() {
    return this.findAllCultivos();
  }

  @Get(':id')
  @RequirePermissions('cultivos.ver')
  async findOneCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findCultivoById(id);
  }

  @Patch(':id')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivoHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCultivoDto) {
    return this.updateCultivo(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('cultivos.eliminar')
  async removeCultivoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeCultivo(id);
  }

  // ==================== INTERNAL METHODS ====================

  // Internal method for WebSocket: handles finding all cultivos with filters by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.findAllCultivos -> returns cultivos list
  async findAllCultivos(filters?: any) {
    return this.cultivosService.findAllCultivos(filters);
  }

  // Internal method for WebSocket: handles finding a cultivo by ID by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.findCultivoById -> returns cultivo
  async findCultivoById(id: number) {
    return this.cultivosService.findCultivoById(id);
  }

  // Internal method for WebSocket: handles creating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.createCultivo -> returns created cultivo
  @UsePipes(new ValidationPipe())
  async createCultivo(createCultivoDto: CreateCultivoDto) {
    return this.cultivosService.createCultivo(createCultivoDto);
  }

  // Internal method for WebSocket: handles updating a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.updateCultivo -> returns updated cultivo
  @UsePipes(new ValidationPipe())
  async updateCultivo(id: number, data: UpdateCultivoDto) {
    return this.cultivosService.updateCultivo(id, data);
  }

  // Internal method for WebSocket: handles removing a cultivo by calling the service
  // Flow: Gateway calls this method -> calls cultivosService.removeCultivo -> returns removed cultivo
  async removeCultivo(id: number) {
    return this.cultivosService.removeCultivo(id);
  }
}
