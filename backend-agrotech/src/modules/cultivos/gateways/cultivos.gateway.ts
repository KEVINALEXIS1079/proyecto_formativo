import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CultivosService } from '../services/cultivos.service';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@WebSocketGateway({ namespace: 'cultivos', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class CultivosGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    @Inject(forwardRef(() => CultivosService))
    private readonly cultivosService: CultivosService,
  ) {}

  @SubscribeMessage('findAllCultivos')
  @RequirePermissions('cultivos.ver')
  async findAllCultivos(@MessageBody() filters: { loteId?: number; subLoteId?: number; estado?: string; q?: string }, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.findAllCultivos(filters);
    client.emit('findAllCultivos.result', result);
    return result;
  }

  @SubscribeMessage('findCultivoById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findCultivoById(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.findCultivoById(data.id);
    client.emit('findCultivoById.result', result);
    return result;
  }

  @SubscribeMessage('createCultivo')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivo(@MessageBody() createCultivoDto: CreateCultivoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.createCultivo(createCultivoDto);
    client.emit('createCultivo.result', result);
    return result;
  }

  @SubscribeMessage('updateCultivo')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivo(@MessageBody() payload: { id: number; data: UpdateCultivoDto }, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.updateCultivo(payload.id, payload.data);
    client.emit('updateCultivo.result', result);
    return result;
  }

  @SubscribeMessage('removeCultivo')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async removeCultivo(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.removeCultivo(data.id);
    client.emit('removeCultivo.result', result);
    return result;
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
