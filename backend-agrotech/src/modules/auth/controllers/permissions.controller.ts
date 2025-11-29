import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  // ==================== PERMISOS ====================
  
  @Get('permisos')
  @RequirePermissions('permisos.ver')
  findAllPermisos() {
    return this.permissionsService.findAllPermisos();
  }

  @Post('permisos')
  @RequirePermissions('permisos.crear')
  createPermiso(@Body() data: { modulo: string; accion: string; descripcion?: string }) {
    return this.permissionsService.createPermiso(data);
  }

  // ==================== ROLES ====================
  
  @Get('roles')
  @RequirePermissions('roles.ver')
  findAllRoles() {
    return this.permissionsService.findAllRoles();
  }

  @Post('roles')
  @RequirePermissions('roles.crear')
  createRol(@Body() data: { nombre: string; descripcion?: string }) {
    return this.permissionsService.createRol(data);
  }

  @Delete('roles/:id')
  @RequirePermissions('roles.eliminar')
  deleteRol(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.deleteRol(id);
  }

  // ==================== PERMISOS DE ROL ====================
  
  @Get('roles/:rolId/permisos')
  @RequirePermissions('roles.ver')
  getPermisosByRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.permissionsService.getPermisosByRol(rolId);
  }

  @Post('roles/:rolId/permisos/:permisoId')
  @RequirePermissions('roles.asignar_permisos')
  assignPermisoToRol(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    return this.permissionsService.assignPermisoToRol(rolId, permisoId);
  }

  @Delete('roles/:rolId/permisos/:permisoId')
  @RequirePermissions('roles.asignar_permisos')
  removePermisoFromRol(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    return this.permissionsService.removePermisoFromRol(rolId, permisoId);
  }

  @Post('roles/:rolId/permisos/sync')
  @RequirePermissions('roles.asignar_permisos')
  syncPermisosRol(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Body() data: { permisoIds: number[] },
  ) {
    return this.permissionsService.syncPermisosRol(rolId, data.permisoIds);
  }

  // ==================== PERMISOS DE USUARIO ====================
  
  @Get('usuarios/:usuarioId/permisos/directos')
  @RequirePermissions('usuarios.ver_permisos')
  getPermisosDirectosByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.permissionsService.getPermisosDirectosByUsuario(usuarioId);
  }

  @Get('usuarios/:usuarioId/permisos/efectivos')
  @RequirePermissions('usuarios.ver_permisos')
  getPermisosEfectivos(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.permissionsService.getPermisosEfectivos(usuarioId);
  }

  @Post('usuarios/:usuarioId/permisos/:permisoId')
  @RequirePermissions('usuarios.asignar_permisos')
  assignPermisoToUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    return this.permissionsService.assignPermisoToUsuario(usuarioId, permisoId);
  }

  @Delete('usuarios/:usuarioId/permisos/:permisoId')
  @RequirePermissions('usuarios.asignar_permisos')
  removePermisoFromUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('permisoId', ParseIntPipe) permisoId: number,
  ) {
    return this.permissionsService.removePermisoFromUsuario(usuarioId, permisoId);
  }


}
