import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WikiController } from '../controllers/wiki.controller';
import {
  WikiCreateDoDto,
  WikiFindAllDoDto,
  WikiFindOneDoDto,
  WikiUpdateDoDto,
  WikiRemoveDoDto,
  WikiFindAllTiposCultivoDoDto,
} from '../dtos/wiki-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@WebSocketGateway({ namespace: 'wiki', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class WikiGateway {
  constructor(private readonly wikiController: WikiController) {}

  @SubscribeMessage('findAllEpas')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAll(@MessageBody() filters: WikiFindAllDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.findAll(filters);
    client.emit('findAllEpas.result', result);
    return result;
  }

  @SubscribeMessage('findEpaById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findOne(@MessageBody() data: WikiFindOneDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.findOne(data.id);
    client.emit('findEpaById.result', result);
    return result;
  }

  @SubscribeMessage('createEpa')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async create(@MessageBody() createEpaDto: WikiCreateDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.create(createEpaDto);
    client.emit('createEpa.result', result);
    return result;
  }

  @SubscribeMessage('updateEpa')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async update(@MessageBody() payload: WikiUpdateDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.update(payload.id, payload.data);
    client.emit('updateEpa.result', result);
    return result;
  }

  @SubscribeMessage('removeEpa')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async remove(@MessageBody() data: WikiRemoveDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.remove(data.id);
    client.emit('removeEpa.result', result);
    return result;
  }

  @SubscribeMessage('findAllTiposCultivo')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAllTiposCultivo(@MessageBody() data: WikiFindAllTiposCultivoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.wikiController.findAllTiposCultivo();
    client.emit('findAllTiposCultivo.result', result);
    return result;
  }
}
