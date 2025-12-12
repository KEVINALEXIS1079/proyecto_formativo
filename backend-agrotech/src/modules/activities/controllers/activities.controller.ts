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
import { FinalizeActivityDto } from '../dtos/finalize-activity.dto';
import { CreateActivityEvidenciaDto, CreateActivityServicioDto } from '../dtos/create-activity.dto';
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se ha proporcionado ningún archivo');
    // Save to 'activities' subfolder
    const url = await this.imageUploadService.uploadImage(file, { folder: 'activities' });
    return { url };
  }

  @Patch(':id/finalize')
  @RequirePermissions('actividades.editar')
  @UsePipes(new ValidationPipe())
  async finalizeActivityHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinalizeActivityDto,
    @Req() req: Request
  ) {
    const userId = this.extractUserId(req);
    // Convert DTO to format expected by service (dates mostly)
    const data = {
      ...dto,
      fechaReal: dto.fechaReal ? new Date(dto.fechaReal) : undefined,
    };
    return this.activitiesService.finalizarActividad(id, data, userId);
  }

  @Post(':id/evidencias')
  @RequirePermissions('actividades.editar')
  @UsePipes(new ValidationPipe())
  async addEvidenciaHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActivityEvidenciaDto,
  ) {
    return this.activitiesService.addEvidencia(id, dto);
  }

  @Post(':id/servicios')
  @RequirePermissions('actividades.editar')
  @UsePipes(new ValidationPipe())
  async addServicioHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActivityServicioDto,
  ) {
    return this.activitiesService.addServicio(id, dto);
  }

  @Post(':id/insumos')
  @RequirePermissions('actividades.editar')
  async addInsumoHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any, // Simplify for now or use specific DTO
    @Req() req: Request
  ) {
    const userId = this.extractUserId(req);
    return this.activitiesService.consumirInsumo(id, dto, userId);
  }


  @Post()
  @RequirePermissions('actividades.crear')
  @UsePipes(new ValidationPipe())
  async createActivityHttp(
    @Req() req: Request,
    @Body() dto: CreateActivityDto,
  ) {
    const userId = this.extractUserId(req);
    const result = await this.create(dto, userId);



    return result;
  }

  @Get()
  @RequirePermissions('actividades.ver')
  async findAllActivitiesHttp(
    @Query() filters: { cultivoId?: number; loteId?: number; tipo?: string },
    @Req() req: Request
  ) {
    const userId = this.extractUserId(req);
    // Optional: Extract role if needed, e.g., const userRole = (req.user as any)?.role;
    return this.findAll(filters, userId);
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

  @Delete(':id')
  @RequirePermissions('actividades.eliminar')
  async deleteActivityHttp(@Param('id', ParseIntPipe) id: number) {
    return this.remove(id);
  }
  // ...
  // Internal method for WebSocket: handles creating an activity by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.create -> returns created activity
  @UsePipes(new ValidationPipe())
  async create(createActivityDto: CreateActivityDto, userId: number) {
    // Validation or extra logic can go here
    return this.activitiesService.create(createActivityDto, userId);
  }

  // Internal method for WebSocket: handles finding all activities by calling the service
  // Flow: Gateway calls this method -> calls activitiesService.findAll -> returns activities list
  async findAll(
    filters?: { cultivoId?: number; loteId?: number; tipo?: string },
    userId?: number // Added userId parameter
  ) {
    return this.activitiesService.findAll(filters, userId);
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
