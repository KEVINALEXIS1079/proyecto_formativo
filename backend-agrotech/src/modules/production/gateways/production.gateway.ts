import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ProductionController } from '../controllers/production.controller';
import { CreateProductoAgroDto } from '../dtos/create-producto-agro.dto';
import {
  ProductionFindAllLotesProduccionDoDto,
  ProductionCreateVentaDoDto,
  ProductionFindAllVentasDoDto,
  ProductionFindVentaByIdDoDto,
  ProductionAnularVentaDoDto,
  ProductionCreateClienteDoDto,
} from '../dtos/production-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { WsCurrentUser } from '../../../common/decorators/ws-current-user.decorator';

@WebSocketGateway({ namespace: 'production', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class ProductionGateway {
  constructor(private readonly productionController: ProductionController) {}

  // ==================== PRODUCTO AGRO ====================

  // WebSocket handler: receives findAllProductos message, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions -> calls controller.findAllProductos -> emits result
  @SubscribeMessage('findAllProductos')
  @RequirePermissions('ventas.ver')
  async findAllProductos(@ConnectedSocket() client: Socket) {
    const result = await this.productionController.findAllProductos();
    client.emit('findAllProductos.result', result);
    return result;
  }

  // WebSocket handler: receives createProducto message, validates DTO, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.createProducto -> emits result
  @SubscribeMessage('createProducto')
  @RequirePermissions('ventas.crear')
  @UsePipes(new ValidationPipe())
  async createProducto(@MessageBody() createProductoDto: CreateProductoAgroDto, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.createProducto(createProductoDto);
    client.emit('createProducto.result', result);
    return result;
  }

  // ==================== LOTES PRODUCCION ====================

  // WebSocket handler: receives findAllLotesProduccion message, validates filters DTO, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.findAllLotesProduccion -> emits result
  @SubscribeMessage('findAllLotesProduccion')
  @RequirePermissions('ventas.ver')
  @UsePipes(new ValidationPipe())
  async findAllLotesProduccion(@MessageBody() filters: ProductionFindAllLotesProduccionDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.findAllLotesProduccion(filters);
    client.emit('findAllLotesProduccion.result', result);
    return result;
  }

  // ==================== VENTAS ====================

  // WebSocket handler: receives createVenta message, validates DTO, calls controller internal method with user ID
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.createVenta -> emits result
  @SubscribeMessage('createVenta')
  @RequirePermissions('ventas.crear')
  @UsePipes(new ValidationPipe())
  async createVenta(@MessageBody() data: ProductionCreateVentaDoDto, @WsCurrentUser() user: any, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.createVenta(data, user.id);
    client.emit('createVenta.result', result);
    return result;
  }

  // WebSocket handler: receives findAllVentas message, validates filters DTO, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.findAllVentas -> emits result
  @SubscribeMessage('findAllVentas')
  @RequirePermissions('ventas.ver')
  @UsePipes(new ValidationPipe())
  async findAllVentas(@MessageBody() filters: ProductionFindAllVentasDoDto, @ConnectedSocket() client: Socket) {
    const transformedFilters = {
      ...filters,
      fechaInicio: filters.fechaInicio ? new Date(filters.fechaInicio) : undefined,
      fechaFin: filters.fechaFin ? new Date(filters.fechaFin) : undefined,
    };
    const result = await this.productionController.findAllVentas(transformedFilters);
    client.emit('findAllVentas.result', result);
    return result;
  }

  // WebSocket handler: receives findVentaById message, validates DTO, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.findVentaById -> emits result
  @SubscribeMessage('findVentaById')
  @RequirePermissions('ventas.ver')
  @UsePipes(new ValidationPipe())
  async findVentaById(@MessageBody() data: ProductionFindVentaByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.findVentaById(data.id);
    client.emit('findVentaById.result', result);
    return result;
  }

  // WebSocket handler: receives anularVenta message, validates DTO, calls controller internal method with user ID
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.anularVenta -> emits result
  @SubscribeMessage('anularVenta')
  @RequirePermissions('ventas.anular')
  @UsePipes(new ValidationPipe())
  async anularVenta(@MessageBody() data: ProductionAnularVentaDoDto, @WsCurrentUser() user: any, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.anularVenta(data.ventaId, user.id);
    client.emit('anularVenta.result', result);
    return result;
  }

  // ==================== CLIENTES ====================

  // WebSocket handler: receives findAllClientes message, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions -> calls controller.findAllClientes -> emits result
  @SubscribeMessage('findAllClientes')
  @RequirePermissions('ventas.ver')
  async findAllClientes(@ConnectedSocket() client: Socket) {
    const result = await this.productionController.findAllClientes();
    client.emit('findAllClientes.result', result);
    return result;
  }

  // WebSocket handler: receives createCliente message, validates DTO, calls controller internal method
  // Flow: Client sends message -> Gateway validates permissions and DTO -> calls controller.createCliente -> emits result
  @SubscribeMessage('createCliente')
  @RequirePermissions('ventas.crear')
  @UsePipes(new ValidationPipe())
  async createCliente(@MessageBody() data: ProductionCreateClienteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.productionController.createCliente(data);
    client.emit('createCliente.result', result);
    return result;
  }
}
