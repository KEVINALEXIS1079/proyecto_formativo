import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CultivosController } from '../controllers/cultivos.controller';
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
  constructor(private readonly cultivosController: CultivosController) {}

  @SubscribeMessage('findAllCultivos')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAllCultivos(@MessageBody() filters: CultivosFindAllDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosController.findAllCultivos(filters);
    client.emit('findAllCultivos.result', result);
    return result;
  }

  @SubscribeMessage('findCultivoById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findCultivoById(@MessageBody() data: CultivosFindByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosController.findCultivoById(data.id);
    client.emit('findCultivoById.result', result);
    return result;
  }

  @SubscribeMessage('createCultivo')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivo(@MessageBody() createCultivoDto: CultivosCreateDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosController.createCultivo(createCultivoDto);
    client.emit('createCultivo.result', result);
    return result;
  }

  @SubscribeMessage('updateCultivo')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivo(@MessageBody() payload: CultivosUpdateDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosController.updateCultivo(payload.id, payload.data);
    client.emit('updateCultivo.result', result);
    return result;
  }

  @SubscribeMessage('removeCultivo')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async removeCultivo(@MessageBody() data: CultivosRemoveDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.cultivosController.removeCultivo(data.id);
    client.emit('removeCultivo.result', result);
    return result;
  }
}
