import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CultivosService } from '../services/cultivos.service';
import {
  CultivosFindAllDoDto,
  CultivosFindByIdDoDto,
  CultivosCreateDoDto,
  CultivosUpdateDoDto,
  CultivosRemoveDoDto,
} from '../dtos/cultivos-do.dto';
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
  ) { }

  @SubscribeMessage('findAllCultivos')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAllCultivos(@MessageBody() filters: CultivosFindAllDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.findAllCultivos(filters);
    client.emit('findAllCultivos.result', result);
    return result;
  }

  @SubscribeMessage('findCultivoById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findCultivoById(@MessageBody() data: CultivosFindByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.findCultivoById(data.id);
    client.emit('findCultivoById.result', result);
    return result;
  }

  @SubscribeMessage('createCultivo')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivo(@MessageBody() createCultivoDto: CultivosCreateDoDto, @ConnectedSocket() client: Socket) {
    // Note: Gateway interactions typically don't set usuarioId unless extracted from socket token
    // For now assuming service handles missing userId gracefully or we extract it if needed
    const result = await this.cultivosService.createCultivo(createCultivoDto);
    client.emit('createCultivo.result', result);
    return result;
  }

  @SubscribeMessage('updateCultivo')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivo(@MessageBody() payload: CultivosUpdateDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.updateCultivo(payload.id, payload.data);
    client.emit('updateCultivo.result', result);
    return result;
  }

  @SubscribeMessage('removeCultivo')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async removeCultivo(@MessageBody() data: CultivosRemoveDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosService.removeCultivo(data.id);
    client.emit('removeCultivo.result', result);
    return result;
  }
}
