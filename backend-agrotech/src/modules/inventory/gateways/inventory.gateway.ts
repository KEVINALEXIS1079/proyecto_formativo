import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InventoryService } from '../services/inventory.service';
import {
  InventoryFindAllInsumosDoDto,
  InventoryFindInsumoByIdDoDto,
  InventoryCreateInsumoDoDto,
  InventoryUpdateInsumoDoDto,
  InventoryRemoveInsumoDoDto,
  InventoryCreateMovimientoDoDto,
  InventoryFindMovimientosByInsumoDoDto,
  InventoryFindAllAlmacenesDoDto,
  InventoryFindAllProveedoresDoDto,
  InventoryFindAllCategoriasDoDto,
} from '../dtos/inventory-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { WsCurrentUser } from '../../../common/decorators/ws-current-user.decorator';

@WebSocketGateway({ namespace: 'inventory', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class InventoryGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
  ) {}

  // ==================== INSUMOS ====================
  
  @SubscribeMessage('findAllInsumos')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findAllInsumos(@MessageBody() filters: InventoryFindAllInsumosDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findAllInsumos(filters);
    client.emit('findAllInsumos.result', result);
    return result;
  }

  @SubscribeMessage('findInsumoById')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findInsumoById(@MessageBody() data: InventoryFindInsumoByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findInsumoById(data.id);
    client.emit('findInsumoById.result', result);
    return result;
  }

  @SubscribeMessage('createInsumo')
  @RequirePermissions('inventario.crear')
  @UsePipes(new ValidationPipe())
  async createInsumo(
    @MessageBody() createInsumoDto: InventoryCreateInsumoDoDto,
    @WsCurrentUser() user: any,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.inventoryService.createInsumo(createInsumoDto, user.id);
    client.emit('createInsumo.result', result);
    return result;
  }

  @SubscribeMessage('updateInsumo')
  @RequirePermissions('inventario.editar')
  @UsePipes(new ValidationPipe())
  async updateInsumo(@MessageBody() payload: InventoryUpdateInsumoDoDto, @ConnectedSocket() client: Socket) {
    const { id, data } = payload;
    const result = await this.inventoryService.updateInsumo(id, data);
    client.emit('updateInsumo.result', result);
    return result;
  }

  @SubscribeMessage('removeInsumo')
  @RequirePermissions('inventario.eliminar')
  @UsePipes(new ValidationPipe())
  async removeInsumo(@MessageBody() data: InventoryRemoveInsumoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.removeInsumo(data.id);
    client.emit('removeInsumo.result', result);
    return result;
  }

  // ==================== MOVIMIENTOS ====================

  @SubscribeMessage('createMovimiento')
  @RequirePermissions('inventario.editar')
  @UsePipes(new ValidationPipe())
  async createMovimiento(@MessageBody() data: InventoryCreateMovimientoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.createMovimiento(data);
    client.emit('createMovimiento.result', result);
    return result;
  }

  @SubscribeMessage('findMovimientosByInsumo')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findMovimientosByInsumo(@MessageBody() data: InventoryFindMovimientosByInsumoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findMovimientosByInsumo(data.insumoId);
    client.emit('findMovimientosByInsumo.result', result);
    return result;
  }

  // ==================== CATÁLOGOS ====================

  @SubscribeMessage('findAllAlmacenes')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findAllAlmacenes(@MessageBody() filters: InventoryFindAllAlmacenesDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findAllAlmacenes();
    client.emit('findAllAlmacenes.result', result);
    return result;
  }

  @SubscribeMessage('findAllProveedores')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findAllProveedores(@MessageBody() filters: InventoryFindAllProveedoresDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findAllProveedores();
    client.emit('findAllProveedores.result', result);
    return result;
  }

  @SubscribeMessage('findAllCategorias')
  @RequirePermissions('inventario.ver')
  @UsePipes(new ValidationPipe())
  async findAllCategorias(@MessageBody() filters: InventoryFindAllCategoriasDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.inventoryService.findAllCategorias();
    client.emit('findAllCategorias.result', result);
    return result;
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
