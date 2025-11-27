import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ActivitiesService } from '../services/activities.service';
import { CreateActivityDto } from '../dtos/create-activity.dto';
import { UpdateActivityDto } from '../dtos/update-activity.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

import { forwardRef, Inject } from '@nestjs/common';
import { ActivitiesGateway } from '../gateways/activities.gateway';

@Controller('activities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    @Inject(forwardRef(() => ActivitiesGateway))
    private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  private extractUserId(request: Request | any): number {
    const userId = request?.user?.id ?? request?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo resolver el usuario autenticado',
      );
    }
    return userId;
  }

  // ==================== HTTP ENDPOINTS ====================

  @Post()
  @RequirePermissions('actividades.crear')
  @UsePipes(new ValidationPipe())
  async createActivityHttp(
    @Req() req: Request,
    @Body() dto: CreateActivityDto,
  ) {
    const userId = this.extractUserId(req);
    const result = await this.create(dto, userId);

    // RF63: Emitir evento en tiempo real
    this.activitiesGateway.broadcast('createActivity.result', result);

    return result;
  }

  @Get()
  @RequirePermissions('actividades.ver')
  async findAllActivitiesHttp() {
    return this.findAll();
  }

  @Get(':id')
  @RequirePermissions('actividades.ver')
  async findOneActivityHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('actividades.editar')
  @UsePipes(new ValidationPipe())
  async updateActivityHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('actividades.eliminar')
  async removeActivityHttp(@Param('id', ParseIntPipe) id: number) {
    return this.remove(id);
  }

  @Post(':id/insumos')
  @RequirePermissions('actividades.editar')
  async addInsumoHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: { insumoId: number; cantidadUso: number; costoUnitarioUso: number },
  ) {
    return this.activitiesService.consumirInsumo(id, data);
  }

  @Post(':id/servicios')
  @RequirePermissions('actividades.editar')
  async addServicioHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nombreServicio: string; horas: number; precioHora: number },
  ) {
    return this.activitiesService.addServicio(id, data);
  }

  @Post(':id/evidencias')
  @RequirePermissions('actividades.editar')
  async addEvidenciaHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { descripcion: string; imagenes: string[] },
  ) {
    return this.activitiesService.addEvidencia(id, data);
  }

  // ==================== INTERNAL METHODS ====================

  // Internal method for WebSocket: handles creating an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.create -> returns created activity
  @UsePipes(new ValidationPipe())
  async create(createActivityDto: CreateActivityDto, userId: number) {
    // Validation or extra logic can go here
    return this.activitiesService.create(createActivityDto, userId);
  }

  // Internal method for WebSocket: handles finding all activities by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.findAll -> returns activities list
  async findAll() {
    return this.activitiesService.findAll();
  }

  // Internal method for WebSocket: handles finding an activity by ID by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.findOne -> returns activity
  async findOne(id: number) {
    return this.activitiesService.findOne(id);
  }

  // Internal method for WebSocket: handles updating an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.update -> returns updated activity
  @UsePipes(new ValidationPipe())
  async update(id: number, updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  // Internal method for WebSocket: handles removing an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.remove -> returns removed activity
  async remove(id: number) {
    return this.activitiesService.remove(id);
  }
}
