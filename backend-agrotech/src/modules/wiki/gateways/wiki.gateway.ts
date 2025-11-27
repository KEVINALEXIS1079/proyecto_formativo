import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WikiService } from '../services/wiki.service';
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
  constructor(private readonly wikiService: WikiService) {}

  @SubscribeMessage('findAllEpas')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAll(
    @MessageBody() filters: WikiFindAllDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.findAll(filters);
    client.emit('findAllEpas.result', result);
    return result;
  }

  @SubscribeMessage('findEpaById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findOne(
    @MessageBody() data: WikiFindOneDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.findOne(data.id);
    client.emit('findEpaById.result', result);
    return result;
  }

  @SubscribeMessage('createEpa')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async create(
    @MessageBody() createEpaDto: WikiCreateDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.create(createEpaDto);
    client.emit('createEpa.result', result);
    return result;
  }

  @SubscribeMessage('updateEpa')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async update(
    @MessageBody() payload: WikiUpdateDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.update(payload.id, payload.data);
    client.emit('updateEpa.result', result);
    return result;
  }

  @SubscribeMessage('removeEpa')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async remove(
    @MessageBody() data: WikiRemoveDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.remove(data.id);
    client.emit('removeEpa.result', result);
    return result;
  }

  @SubscribeMessage('findAllTiposCultivo')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAllTiposCultivo(
    @MessageBody() data: WikiFindAllTiposCultivoDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.wikiService.findAllTiposCultivo();
    client.emit('findAllTiposCultivo.result', result);
    return result;
  }
}
