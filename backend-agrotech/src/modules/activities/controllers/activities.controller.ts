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
