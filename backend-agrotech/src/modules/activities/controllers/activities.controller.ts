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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadService } from '../../../common/services/image-upload.service';
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
    private readonly imageUploadService: ImageUploadService,
    @Inject(forwardRef(() => ActivitiesGateway))
    private readonly activitiesGateway: ActivitiesGateway,
  ) { }

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
  async findAllActivitiesHttp(@Query() filters?: { cultivoId?: number; loteId?: number; tipo?: string }) {
    return this.findAll(filters);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.imageUploadService.uploadImage(file);
    return { url };
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
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.update(id, dto, userId);
  }

  @Patch(':id/finalize')
  @RequirePermissions('actividades.editar')
  async finalizeActivityHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.activitiesService.finalizarActividad(id, data, userId);
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
    @Req() req: Request,
    @Body()
    data: { insumoId: number; cantidadUso: number; costoUnitarioUso: number },
  ) {
    const userId = this.extractUserId(req);
    return this.activitiesService.consumirInsumo(id, data, userId);
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
  async findAll(filters?: { cultivoId?: number; loteId?: number; tipo?: string }) {
    return this.activitiesService.findAll(filters);
  }

  // Internal method for WebSocket: handles finding an activity by ID by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.findOne -> returns activity
  async findOne(id: number) {
    return this.activitiesService.findOne(id);
  }

  // Internal method for WebSocket: handles updating an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.update -> returns updated activity
  @UsePipes(new ValidationPipe())
  async update(id: number, updateActivityDto: UpdateActivityDto, userId?: number) {
    return this.activitiesService.update(id, updateActivityDto, userId);
  }

  // Internal method for WebSocket: handles removing an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.remove -> returns removed activity
  async remove(id: number) {
    return this.activitiesService.remove(id);
  }
}
