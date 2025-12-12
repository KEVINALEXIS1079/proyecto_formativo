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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import * as fs from 'fs';
import { InventoryService } from '../services/inventory.service';
import { MovimientoInsumoService } from '../services/movimiento-insumo.service';
import { DepreciationService } from '../services/depreciation.service';
import { InsumoEstado, TipoInsumo } from '../entities/insumo.entity';
import { CreateInsumoDto } from '../dtos/create-insumo.dto';
import { UpdateInsumoDto } from '../dtos/update-insumo.dto';
import { CreateActivoFijoDto } from '../dtos/create-activo-fijo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('insumos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly movimientoInsumoService: MovimientoInsumoService,
    private readonly depreciationService: DepreciationService, // Injection
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

  // ==================== ACTIVOS FIJOS ====================

  @Get('activos-fijos')
  @RequirePermissions('inventario.ver')
  async findAllActivosFijos() {
    // Filtramos insumos que sean NO_CONSUMIBLE
    return this.inventoryService.findAllInsumos({ tipoInsumo: TipoInsumo.NO_CONSUMIBLE });
  }

  @Post('activos-fijos')
  @RequirePermissions('inventario.crear')
  @UseInterceptors(FileInterceptor('imagen'))
  @UsePipes(new ValidationPipe())
  async createActivoFijo(
    @Req() req: Request,
    @Body() dto: CreateActivoFijoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      const userId = this.extractUserId(req);
      const cantidad = dto.cantidad && dto.cantidad > 0 ? dto.cantidad : 1;
      const createdAssets = [];

      for (let i = 0; i < cantidad; i++) {
        // Generar nombre con índice si es múltiple
        const nombre = cantidad > 1 ? `${dto.nombre} (${i + 1})` : dto.nombre;

        // Convertir DTO a lo que espera createInsumo, marcando como NO_CONSUMIBLE
        const insumoData: any = {
          ...dto,
          nombre,
          tipoInsumo: TipoInsumo.NO_CONSUMIBLE,
          presentacionTipo: 'UNIDAD', // Valores por defecto para campos obligatorios de Insumo
          presentacionCantidad: 1,
          presentacionUnidad: 'UND',
          unidadUso: 'HORA',
          tipoMateria: 'solido', // Debe ser 'solido' o 'liquido' según el enum
          factorConversionUso: 1,
          stockPresentacion: 1,
          stockUso: 1,
          precioUnitarioPresentacion: dto.costoAdquisicion,
          precioUnitarioUso: 0, // Se calcula con depreciación
          valorInventario: dto.costoAdquisicion,
          estado: InsumoEstado.DISPONIBLE
        };

        // Crear el insumo
        const createdInsumo = await this.inventoryService.createInsumo(insumoData, userId);

        // Si hay archivo, guardar una copia para este insumo
        if (file) {
          const fs = require('fs').promises;
          const path = require('path');

          // Crear directorio si no existe
          const uploadDir = 'uploads/insumos';
          await fs.mkdir(uploadDir, { recursive: true });

          // Generar nombre único para el archivo para cada activo
          // Usamos random o index para evitar colisiones si va muy rápido
          const uniqueSuffix = `${Date.now()}-${i}-${Math.round(Math.random() * 1E9)}`;
          const filename = `${uniqueSuffix}-${file.originalname}`;
          const filePath = path.join(uploadDir, filename);

          // Guardar el archivo
          await fs.writeFile(filePath, file.buffer);

          // Actualizar el insumo con la ruta de la imagen
          await this.inventoryService.updateInsumo(createdInsumo.id, {
            fotoUrl: filePath.replace(/\\/g, '/')
          });

          // Asignar url al objeto retornado
          createdInsumo.fotoUrl = filePath.replace(/\\/g, '/');
        }

        createdAssets.push(createdInsumo);
      }

      // Devolver el primero o la lista (el frontend espera uno normalmente, pero si es bulk podría esperar info)
      // Para mantener compatibilidad con useMutation que espera un objeto single success en general o array.
      // Retornaremos el último creado o un wrapper. Como el frontend hace invalidateQueries, no es crítico el retorno exacto
      // excepto para mensajes. Retornemos el último para compatibilidad simple o el array si el frontend lo soporta.
      // Dado que el frontend actual CreateActivoFijoModal usa mutation result pero principalmente confía en onSuccess:
      return cantidad === 1 ? createdAssets[0] : { message: `${cantidad} activos creados`, assets: createdAssets };

    } catch (error) {
      console.error('Error creating activo fijo:', error);
      throw error;
    }
  }

  @Post('activos-fijos/:id/mantenimiento')
  @RequirePermissions('inventario.editar')
  async registrarMantenimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { costo?: number; descripcion?: string }
  ) {
    return this.inventoryService.registrarMantenimiento(id, data);
  }

  @Patch('activos-fijos/:id/finalizar-mantenimiento')
  @RequirePermissions('inventario.editar')
  async finalizarMantenimiento(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.inventoryService.finalizarMantenimiento(id);
  }

  @Post('activos-fijos/:id/dar-baja')
  @RequirePermissions('inventario.eliminar')
  async darDeBajaActivoFijo(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { motivo: string },
    @Req() req: Request
  ) {
    const userId = this.extractUserId(req);
    if (!data.motivo) throw new BadRequestException('El motivo es requerido');
    return this.inventoryService.darDeBajaActiveFijo(id, data.motivo, userId);
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
  async findAllInsumosHttp(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('almacenId') almacenId?: string,
    @Query('tipoInsumo') tipoInsumo?: string,
  ) {
    const filters: any = {};
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    if (q) filters.q = q;
    // Default to CONSUMIBLE if type filter is not explicitly provided
    if (tipoInsumo) {
      filters.tipoInsumo = tipoInsumo;
    } else {
      // If we are filtering by specific ID (e.g. searching for a specific item even if it's not consumable), we might not want this default?
      // But user request is "la pala no la coloques en insumo". Usually Insumo list is general.
      // Let's safe default to CONSUMIBLE.
      filters.tipoInsumo = TipoInsumo.CONSUMIBLE;
    }
    if (categoriaId) filters.categoriaId = parseInt(categoriaId);
    if (proveedorId) filters.proveedorId = parseInt(proveedorId);
    if (almacenId) filters.almacenId = parseInt(almacenId);

    return this.findAllInsumos(filters);
  }

  // ==================== MOVIMIENTOS ====================

  @Post('movimientos')
  @RequirePermissions('inventario.crear')
  @UsePipes(new ValidationPipe())
  async createMovimiento(@Body() data: any) {
    return this.inventoryService.createMovimiento(data);
  }

  @Get('alerts')
  @RequirePermissions('inventario.ver')
  async getStockAlerts() {
    return this.inventoryService.getStockAlerts();
  }

  @Get('movimientos')
  @RequirePermissions('inventario.ver')
  async findMovimientosByInsumo(
    @Query('insumoId') insumoId?: string,
    @Query('tipoMovimiento') tipoMovimiento?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    console.log('DEBUG: findMovimientosByInsumo called with params:', { insumoId, tipoMovimiento, fechaDesde, fechaHasta });
    const filters: any = {};

    if (insumoId) {
      const parsedId = parseInt(insumoId);
      if (isNaN(parsedId)) {
        console.error('DEBUG: Invalid insumoId, not a number:', insumoId);
        throw new Error('insumoId must be a valid number');
      }
      filters.insumoId = parsedId;
    }
    if (tipoMovimiento) filters.tipo = tipoMovimiento;
    if (fechaDesde) filters.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) filters.fechaHasta = new Date(fechaHasta);

    console.log('DEBUG: Filters applied:', filters);
    const result = await this.inventoryService.findAllMovimientos(filters);
    console.log('DEBUG: Movimientos result:', result);
    return result;
  }

  @Get('movimientos/:id')
  @RequirePermissions('inventario.ver')
  async findOneMovimiento(@Param('id', ParseIntPipe) id: number) {
    return this.movimientoInsumoService.findOne(id);
  }

  @Get(':id/has-movimientos')
  @RequirePermissions('inventario.ver')
  async hasMovimientosByInsumo(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.hasMovimientosByInsumo(id);
  }

  /*
  @Delete('movimientos/:id')
  @RequirePermissions('inventario.eliminar')
  async deleteMovimiento(@Param('id', ParseIntPipe) id: number) {
    throw new BadRequestException('Los movimientos de inventario son inmutables por seguridad.');
    // return this.inventoryService.deleteMovimiento(id);
  }

  @Patch('movimientos/:id')
  @RequirePermissions('inventario.editar')
  @UsePipes(new ValidationPipe())
  async updateMovimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    throw new BadRequestException('Los movimientos de inventario son inmutables por seguridad.');
    // return this.inventoryService.updateMovimiento(id, data);
  }
  */

  // ==================== CATÁLOGOS ====================

  @Get('almacenes')
  @RequirePermissions('inventario.ver')
  async findAllAlmacenes() {
    console.log('DEBUG: Recibida request GET /insumos/almacenes');
    return this.inventoryService.findAllAlmacenes();
  }

  @Get('almacenes/:id')
  @RequirePermissions('inventario.ver')
  async findOneAlmacen(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOneAlmacen(id);
  }

  @Post('almacenes')
  @RequirePermissions('inventario.crear')
  async createAlmacen(@Body() data: { nombre: string; descripcion?: string }) {
    console.log('DEBUG: Datos recibidos en createAlmacen:', data);
    // Mapear descripcion correctamente
    const mappedData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
    };

    return this.inventoryService.createAlmacen(mappedData);
  }

  @Get('proveedores')
  @RequirePermissions('inventario.ver')
  async findAllProveedores() {
    console.log('DEBUG: Recibida request GET /insumos/proveedores');
    return this.inventoryService.findAllProveedores();
  }

  @Get('proveedores/:id')
  @RequirePermissions('inventario.ver')
  async findOneProveedor(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOneProveedor(id);
  }

  @Post('proveedores')
  @RequirePermissions('inventario.crear')
  async createProveedor(
    @Body() data: { nombre: string; contacto?: string; telefono?: string },
  ) {
    console.log('DEBUG: Datos recibidos en createProveedor:', data);
    return this.inventoryService.createProveedor(data);
  }

  @Patch('proveedores/:id')
  @RequirePermissions('inventario.editar')
  async updateProveedor(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nombre?: string; contacto?: string; telefono?: string },
  ) {
    console.log('DEBUG: Actualizando proveedor', id, 'con datos:', data);
    return this.inventoryService.updateProveedor(id, data);
  }

  @Delete('proveedores/:id')
  @RequirePermissions('inventario.eliminar')
  async removeProveedor(@Param('id', ParseIntPipe) id: number) {
    console.log('DEBUG: Eliminando proveedor', id);
    return this.inventoryService.removeProveedor(id);
  }

  @Patch('almacenes/:id')
  @RequirePermissions('inventario.editar')
  async updateAlmacen(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nombre?: string; descripcion?: string },
  ) {
    console.log('DEBUG: Actualizando almacén', id, 'con datos:', data);
    return this.inventoryService.updateAlmacen(id, data);
  }

  @Delete('almacenes/:id')
  @RequirePermissions('inventario.eliminar')
  async removeAlmacen(@Param('id', ParseIntPipe) id: number) {
    console.log('DEBUG: Eliminando almacén', id);
    return this.inventoryService.removeAlmacen(id);
  }

  @Get('categorias')
  @RequirePermissions('inventario.ver')
  async findAllCategorias(@Query('tipoInsumo') tipoInsumo?: string) {
    return this.inventoryService.findAllCategorias(tipoInsumo as TipoInsumo);
  }

  @Post('categorias')
  @RequirePermissions('inventario.crear')
  async createCategoria(
    @Body() data: any,
  ) {
    console.log('Datos recibidos en controlador createCategoria:', data);

    // Mapear nombre_categoria_insumo a nombre para compatibilidad
    const mappedData = {
      nombre: data.nombre_categoria_insumo || data.nombre,
      descripcion: data.descripcion,
      tipoInsumo: data.tipoInsumo,
    };

    return this.inventoryService.createCategoria(mappedData);
  }

  @Get('categorias/:id')
  @RequirePermissions('inventario.ver')
  async findOneCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOneCategoria(id);
  }

  @Patch('categorias/:id')
  @RequirePermissions('inventario.editar')
  async updateCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nombre?: string; descripcion?: string },
  ) {
    console.log('DEBUG: Actualizando categoría', id, 'con datos:', data);
    return this.inventoryService.updateCategoria(id, data);
  }

  @Delete('categorias/:id')
  @RequirePermissions('inventario.eliminar')
  async removeCategoria(@Param('id', ParseIntPipe) id: number) {
    console.log('DEBUG: Eliminando categoría', id);
    return this.inventoryService.removeCategoria(id);
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
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.updateInsumo(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions('inventario.eliminar')
  async removeInsumoHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeInsumo(id);
  }

  @Post(':id/upload-image')
  @RequirePermissions('inventario.editar')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validar que el insumo existe
    await this.findInsumoById(id);

    // Generar nombre único para el archivo
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = `uploads/insumos/${filename}`;

    // Guardar el archivo
    await fs.promises.writeFile(filePath, file.buffer);

    // Generar URL relativa
    const fotoUrl = `/uploads/insumos/${filename}`;

    // Actualizar el insumo en la base de datos
    await this.updateInsumo(id, { fotoUrl });

    // Retornar el insumo actualizado
    return this.findInsumoById(id);
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
  async updateInsumo(id: number, updateInsumoDto: UpdateInsumoDto, usuarioId?: number) {
    return this.inventoryService.updateInsumo(id, updateInsumoDto, usuarioId);
  }

  // Internal method for WebSocket: handles removing an insumo by calling the service
  // Flow: Gateway calls this method -> calls inventoryService.removeInsumo -> returns removed insumo
  async removeInsumo(id: number) {
    return this.inventoryService.removeInsumo(id);
  }
}
