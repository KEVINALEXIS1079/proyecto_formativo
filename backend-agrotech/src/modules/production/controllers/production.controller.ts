import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
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

  // Internal method for WebSocket: handles finding all products by calling the service
  // Flow: Gateway calls this method -> calls productionService.findAllProductos -> returns product list
  async findAllProductos() {
    return this.productionService.findAllProductos();
  }

  // Internal method for WebSocket: handles creating a product by calling the service
  // Flow: Gateway calls this method -> calls productionService.createProducto -> returns created product
  @UsePipes(new ValidationPipe())
  async createProducto(createProductoDto: CreateProductoAgroDto) {
    return this.productionService.createProducto(createProductoDto);
  }

  // ==================== LOTES PRODUCCION ====================

  // Internal method for WebSocket: handles finding all production lots with filters by calling the service
  // Flow: Gateway calls this method -> calls productionService.findAllLotesProduccion -> returns lot list
  async findAllLotesProduccion(filters?: { productoAgroId?: number; cultivoId?: number }) {
    return this.productionService.findAllLotesProduccion(filters);
  }

  @Post('lotes-produccion')
  @RequirePermissions('produccion.crear')
  @UsePipes(new ValidationPipe())
  async createLoteProduccionHttp(@Body() dto: CreateLoteProduccionDto) {
    return this.productionService.createLoteProduccion(dto);
  }

  @Get('lotes-produccion')
  @RequirePermissions('produccion.ver')
  async findAllLotesProduccionHttp() {
    return this.productionService.findAllLotesProduccion();
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

  // Internal method for WebSocket: handles creating a sale by calling the service
  // Flow: Gateway calls this method -> calls productionService.createVenta -> returns created sale
  @UsePipes(new ValidationPipe())
  async createVenta(data: { clienteId?: number; detalles: Array<{ loteProduccionId: number; cantidadKg: number; precioUnitarioKg: number }>; pagos: Array<{ metodoPago: string; monto: number }> }, userId: number) {
    return this.productionService.createVenta({ ...data, usuarioId: userId });
  }

  // Internal method for WebSocket: handles finding all sales with filters by calling the service
  // Flow: Gateway calls this method -> calls productionService.findAllVentas -> returns sale list
  async findAllVentas(filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }) {
    return this.productionService.findAllVentas(filters);
  }

  // Internal method for WebSocket: handles finding a sale by ID by calling the service
  // Flow: Gateway calls this method -> calls productionService.findVentaById -> returns sale
  async findVentaById(id: number) {
    return this.productionService.findVentaById(id);
  }

  // Internal method for WebSocket: handles canceling a sale by calling the service
  // Flow: Gateway calls this method -> calls productionService.anularVenta -> returns canceled sale
  async anularVenta(ventaId: number, userId: number) {
    return this.productionService.anularVenta(ventaId, userId);
  }

  // ==================== CLIENTES ====================

  // Internal method for WebSocket: handles finding all clients by calling the service
  // Flow: Gateway calls this method -> calls productionService.findAllClientes -> returns client list
  async findAllClientes() {
    return this.productionService.findAllClientes();
  }

  // Internal method for WebSocket: handles creating a client by calling the service
  // Flow: Gateway calls this method -> calls productionService.createCliente -> returns created client
  async createCliente(data: { nombre: string; identificacion?: string; telefono?: string; correo?: string }) {
    return this.productionService.createCliente(data);
  }
}
