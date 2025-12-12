import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GeoController } from '../controllers/geo.controller';
import {
  GeoFindAllLotesDoDto,
  GeoFindLoteByIdDoDto,
  GeoCreateLoteDoDto,
  GeoUpdateLoteDoDto,
  GeoRemoveLoteDoDto,
  GeoFindAllSubLotesDoDto,
  GeoFindSubLoteByIdDoDto,
  GeoCreateSubLoteDoDto,
  GeoUpdateSubLoteDoDto,
  GeoRemoveSubLoteDoDto,

} from '../dtos/geo-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

import { forwardRef, Inject } from '@nestjs/common';
import { GeoService } from '../services/geo.service';

@WebSocketGateway({ namespace: 'geo', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class GeoGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => GeoService))
    private readonly geoService: GeoService,
  ) { }

  // ==================== LOTES ====================

  @SubscribeMessage('findAllLotes')
  @RequirePermissions('lotes.ver')
  async findAllLotes(@MessageBody() filters: GeoFindAllLotesDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.findAllLotes();
    client.emit('findAllLotes.result', result);
    return result;
  }

  @SubscribeMessage('findLoteById')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findLoteById(@MessageBody() data: GeoFindLoteByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.findLoteById(data.id);
    client.emit('findLoteById.result', result);
    return result;
  }

  @SubscribeMessage('createLote')
  @RequirePermissions('lotes.crear')
  @UsePipes(new ValidationPipe())
  async createLote(@MessageBody() createLoteDto: GeoCreateLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.createLote(createLoteDto);
    client.emit('createLote.result', result);
    return result;
  }

  @SubscribeMessage('updateLote')
  @RequirePermissions('lotes.editar')
  @UsePipes(new ValidationPipe())
  async updateLote(@MessageBody() payload: GeoUpdateLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.updateLote(payload.id, payload.data);
    client.emit('updateLote.result', result);
    return result;
  }

  @SubscribeMessage('removeLote')
  @RequirePermissions('lotes.eliminar')
  @UsePipes(new ValidationPipe())
  async removeLote(@MessageBody() data: GeoRemoveLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.removeLote(data.id);
    client.emit('removeLote.result', result);
    return result;
  }

  // ==================== SUBLOTES ====================

  @SubscribeMessage('findAllSubLotes')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findAllSubLotes(@MessageBody() filters: GeoFindAllSubLotesDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.findAllSubLotes(filters.loteId);
    client.emit('findAllSubLotes.result', result);
    return result;
  }

  @SubscribeMessage('findSubLoteById')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findSubLoteById(@MessageBody() data: GeoFindSubLoteByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.findSubLoteById(data.id);
    client.emit('findSubLoteById.result', result);
    return result;
  }

  @SubscribeMessage('createSubLote')
  @RequirePermissions('lotes.crear')
  @UsePipes(new ValidationPipe())
  async createSubLote(@MessageBody() createSubLoteDto: GeoCreateSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.createSubLote(createSubLoteDto);
    client.emit('createSubLote.result', result);
    return result;
  }

  @SubscribeMessage('updateSubLote')
  @RequirePermissions('lotes.editar')
  @UsePipes(new ValidationPipe())
  async updateSubLote(@MessageBody() payload: GeoUpdateSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.updateSubLote(payload.id, payload.data);
    client.emit('updateSubLote.result', result);
    return result;
  }

  @SubscribeMessage('removeSubLote')
  @RequirePermissions('lotes.eliminar')
  @UsePipes(new ValidationPipe())
  async removeSubLote(@MessageBody() data: GeoRemoveSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoService.removeSubLote(data.id);
    client.emit('removeSubLote.result', result);
    return result;
  }
}
