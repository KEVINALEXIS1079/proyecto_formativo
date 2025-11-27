import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { InventoryService } from '../services/inventory.service';
import { CreateInsumoDto } from '../dtos/create-insumo.dto';
import { UpdateInsumoDto } from '../dtos/update-insumo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('insumos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

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
  @RequirePermissions('inventario.crear')
  @UsePipes(new ValidationPipe())
  async createInsumoHttp(@Req() req: Request, @Body() dto: CreateInsumoDto) {
    const userId = this.extractUserId(req);
    return this.createInsumo(dto, userId);
  }

  @Get()
  @RequirePermissions('inventario.ver')
  async findAllInsumosHttp() {
    return this.findAllInsumos();
  }

  // ==================== MOVIMIENTOS ====================

  @Post('movimientos')
  @RequirePermissions('inventario.crear')
  @UsePipes(new ValidationPipe())
  async createMovimiento(@Body() data: any) {
    return this.inventoryService.createMovimiento(data);
  }

  @Get('movimientos')
  @RequirePermissions('inventario.ver')
  async findMovimientosByInsumo(
    @Query('insumoId', ParseIntPipe) insumoId: number,
  ) {
    return this.inventoryService.findMovimientosByInsumo(insumoId);
  }

  // ==================== CATÁLOGOS ====================

  @Get('almacenes')
  @RequirePermissions('inventario.ver')
  async findAllAlmacenes() {
    return this.inventoryService.findAllAlmacenes();
  }

  @Post('almacenes')
  @RequirePermissions('inventario.crear')
  async createAlmacen(@Body() data: { nombre: string; ubicacion?: string }) {
    return this.inventoryService.createAlmacen(data);
  }

  @Get('proveedores')
  @RequirePermissions('inventario.ver')
  async findAllProveedores() {
    return this.inventoryService.findAllProveedores();
  }

  @Post('proveedores')
  @RequirePermissions('inventario.crear')
  async createProveedor(
    @Body() data: { nombre: string; contacto?: string; telefono?: string },
  ) {
    return this.inventoryService.createProveedor(data);
  }

  @Get('categorias')
  @RequirePermissions('inventario.ver')
  async findAllCategorias() {
    return this.inventoryService.findAllCategorias();
  }

  @Post('categorias')
  @RequirePermissions('inventario.crear')
  async createCategoria(
    @Body() data: { nombre: string; descripcion?: string },
  ) {
    return this.inventoryService.createCategoria(data);
  }

  // ==================== INSUMOS BY ID (must be after specific routes) ====================

  @Get(':id')
  @RequirePermissions('inventario.ver')
  async findOneInsumoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.findInsumoById(id);
  }

  @Patch(':id')
  @RequirePermissions('inventario.editar')
  @UsePipes(new ValidationPipe())
  async updateInsumoHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInsumoDto,
  ) {
    return this.updateInsumo(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('inventario.eliminar')
  async removeInsumoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeInsumo(id);
  }

  // ==================== INSUMOS ====================

  // Internal method for WebSocket: handles finding all insumos by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.findAllInsumos -> returns insumos list
  async findAllInsumos(filters?: any) {
    return this.inventoryService.findAllInsumos(filters);
  }

  // Internal method for WebSocket: handles finding an insumo by ID by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.findInsumoById -> returns insumo
  async findInsumoById(id: number) {
    return this.inventoryService.findInsumoById(id);
  }

  // Internal method for WebSocket: handles creating an insumo by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.createInsumo -> returns created insumo
  @UsePipes(new ValidationPipe())
  async createInsumo(createInsumoDto: CreateInsumoDto, userId: number) {
    return this.inventoryService.createInsumo(createInsumoDto, userId);
  }

  // Internal method for WebSocket: handles updating an insumo by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.updateInsumo -> returns updated insumo
  @UsePipes(new ValidationPipe())
  async updateInsumo(id: number, updateInsumoDto: UpdateInsumoDto) {
    return this.inventoryService.updateInsumo(id, updateInsumoDto);
  }

  // Internal method for WebSocket: handles removing an insumo by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.removeInsumo -> returns removed insumo
  async removeInsumo(id: number) {
    return this.inventoryService.removeInsumo(id);
  }
}
