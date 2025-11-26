import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe, Req, Query } from '@nestjs/common';
import { ProductionService } from '../services/production.service';
import { CreateProductoAgroDto } from '../dtos/create-producto-agro.dto';
import { CreateLoteProduccionDto } from '../dtos/create-lote-produccion.dto';
import { UpdateLoteProduccionDto } from '../dtos/update-lote-produccion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('production')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  // ==================== PRODUCTO AGRO ====================

  @Get('productos')
  @RequirePermissions('produccion.ver')
  async findAllProductos() {
    return this.productionService.findAllProductos();
  }

  @Post('productos')
  @RequirePermissions('produccion.crear')
  @UsePipes(new ValidationPipe())
  async createProducto(@Body() createProductoDto: CreateProductoAgroDto) {
    return this.productionService.createProducto(createProductoDto);
  }

  // ==================== LOTES PRODUCCION ====================

  @Get('lotes-produccion')
  @RequirePermissions('produccion.ver')
  async findAllLotesProduccion(@Query() filters?: { productoAgroId?: number; cultivoId?: number }) {
    return this.productionService.findAllLotesProduccion(filters);
  }

  @Post('lotes-produccion')
  @RequirePermissions('produccion.crear')
  @UsePipes(new ValidationPipe())
  async createLoteProduccionHttp(@Body() dto: CreateLoteProduccionDto) {
    return this.productionService.createLoteProduccion(dto);
  }

  @Get('lotes-produccion/:id')
  @RequirePermissions('produccion.ver')
  async findLoteProduccionByIdHttp(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findLoteProduccionById(id);
  }

  @Patch('lotes-produccion/:id')
  @RequirePermissions('produccion.editar')
  @UsePipes(new ValidationPipe())
  async updateLoteProduccionHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoteProduccionDto) {
    return this.productionService.updateLoteProduccion(id, dto);
  }

  @Delete('lotes-produccion/:id')
  @RequirePermissions('produccion.eliminar')
  async removeLoteProduccionHttp(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.removeLoteProduccion(id);
  }

  // ==================== VENTAS ====================

  @Post('ventas')
  @RequirePermissions('ventas.crear')
  @UsePipes(new ValidationPipe())
  async createVenta(@Body() data: { clienteId?: number; detalles: Array<{ loteProduccionId: number; cantidadKg: number; precioUnitarioKg: number }>; pagos: Array<{ metodoPago: string; monto: number }> }, @Req() req: any) {
    const userId = req.user.id;
    return this.productionService.createVenta({ ...data, usuarioId: userId });
  }

  @Get('ventas')
  @RequirePermissions('ventas.ver')
  async findAllVentas(@Query() filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }) {
    return this.productionService.findAllVentas(filters);
  }

  @Get('ventas/:id')
  @RequirePermissions('ventas.ver')
  async findVentaById(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findVentaById(id);
  }

  @Post('ventas/:id/anular')
  @RequirePermissions('ventas.anular')
  async anularVenta(@Param('id', ParseIntPipe) ventaId: number, @Req() req: any) {
    const userId = req.user.id;
    return this.productionService.anularVenta(ventaId, userId);
  }

  // ==================== CLIENTES ====================

  @Get('clientes')
  @RequirePermissions('ventas.ver')
  async findAllClientes() {
    return this.productionService.findAllClientes();
  }

  @Post('clientes')
  @RequirePermissions('ventas.crear')
  async createCliente(@Body() data: { nombre: string; identificacion?: string; telefono?: string; correo?: string }) {
    return this.productionService.createCliente(data);
  }
}
