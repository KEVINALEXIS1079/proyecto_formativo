import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UsersService } from '../services/users.service';
import {
  CreateUserByAdminDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeRoleDto,
  ChangeStatusDto,
  UpdateUserByAdminDto,
} from '../dtos/user-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { Query } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private extractUserId(request: Request | any): number {
    const userId = request?.user?.id ?? request?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('No se pudo resolver el usuario autenticado');
    }
    return userId;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  // Internal method for WebSocket: handles finding all users with filters by calling the service
  // Flow: Gateway calls this method -> calls usersService.findAll -> returns user list
  async findAll(filters?: { q?: string; rolId?: number; estado?: string }) {
    return this.usersService.findAll(filters);
  }

  // Internal method for WebSocket: handles finding a user by ID by calling the service
  // Flow: Gateway calls this method -> calls usersService.findById -> returns user
  async findById(id: number) {
    return this.usersService.findById(id);
  }

  // RF67: Crear usuario por admin
  async createByAdmin(dto: CreateUserByAdminDto) {
    return this.usersService.createByAdmin(dto);
  }

  // RF68: Actualizar perfil
  async updateProfile(id: number, dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  // RF69: Cambiar rol
  async changeRole(id: number, dto: ChangeRoleDto) {
    return this.usersService.changeRole(id, dto);
  }

  // RF70: Cambiar estado
  async changeStatus(id: number, dto: ChangeStatusDto) {
    return this.usersService.changeStatus(id, dto);
  }

  // RF71: Cambiar contraseña
  async changePassword(id: number, dto: ChangePasswordDto) {
    return this.usersService.changePassword(id, dto);
  }

  // ==================== USER MANAGEMENT ====================

  @Get()
  @RequirePermissions('usuarios.ver')
  async findAllUsersHttp(@Query() pagination: PaginationDto, @Query('rolId') rolId?: number, @Query('estado') estado?: string) {
    const result = await this.usersService.findAllPaginated(pagination, { rolId, estado });
    return {
      ...result,
      data: result.data.map(user => this.sanitizeUser(user)),
    };
  }

  // RF72: Perfil self-service
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfileHttp(@Req() req: Request) {
    const user = await this.usersService.findById(this.extractUserId(req));
    return this.sanitizeUser(user);
  }

  async getMyProfile(userId: number) {
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateMyProfileHttp(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = this.extractUserId(req);
    const allowedData: UpdateProfileDto = {};
    if (dto.nombre !== undefined) allowedData.nombre = dto.nombre;
    if (dto.apellido !== undefined) allowedData.apellido = dto.apellido;
    if (dto.idFicha !== undefined) allowedData.idFicha = dto.idFicha;
    if (dto.telefono !== undefined) allowedData.telefono = dto.telefono;
    if (dto.avatarUrl !== undefined) allowedData.avatarUrl = dto.avatarUrl;

    const updated = await this.usersService.updateProfile(userId, allowedData);
    return this.sanitizeUser(updated);
  }

  async updateMyProfile(userId: number, dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changeMyPassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = this.extractUserId(req);
    return this.usersService.changePassword(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMyAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = this.extractUserId(req);
    const updatedUser = await this.usersService.uploadAvatar(userId, file);
    return this.sanitizeUser(updatedUser);
  }

  @Get(':id')
  @RequirePermissions('usuarios.ver_perfil')
  async findUserByIdHttp(@Param('id', ParseIntPipe) id: number) {
    const user = await this.findById(id);
    return this.sanitizeUser(user);
  }

  @Patch(':id/role')
  @RequirePermissions('usuarios.cambiar_rol')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changeUserRoleHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeRoleDto) {
    return this.changeRole(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('usuarios.eliminar')
  async removeUserHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeUser(id);
  }

  @Patch(':id')
  @RequirePermissions('usuarios.editar')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUserByAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserByAdminDto) {
    const updated = await this.usersService.updateByAdmin(id, dto);
    return this.sanitizeUser(updated);
  }

  // Internal method for WebSocket: handles removing a user by calling the service
  // Flow: Gateway calls this method -> calls usersService.remove -> returns removed user
  async removeUser(id: number) {
    return this.usersService.remove(id);
  }
}
