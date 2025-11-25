import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
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
  GeoFindAllCultivosDoDto,
  GeoFindCultivoByIdDoDto,
  GeoCreateCultivoDoDto,
  GeoUpdateCultivoDoDto,
  GeoRemoveCultivoDoDto,
} from '../dtos/geo-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@WebSocketGateway({ namespace: 'geo', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class GeoGateway {
  constructor(private readonly geoController: GeoController) {}

  // ==================== LOTES ====================
  
  @SubscribeMessage('findAllLotes')
  @RequirePermissions('lotes.ver')
  async findAllLotes(@MessageBody() filters: GeoFindAllLotesDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findAllLotes();
    client.emit('findAllLotes.result', result);
    return result;
  }

  @SubscribeMessage('findLoteById')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findLoteById(@MessageBody() data: GeoFindLoteByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findLoteById(data.id);
    client.emit('findLoteById.result', result);
    return result;
  }

  @SubscribeMessage('createLote')
  @RequirePermissions('lotes.crear')
  @UsePipes(new ValidationPipe())
  async createLote(@MessageBody() createLoteDto: GeoCreateLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.createLote(createLoteDto);
    client.emit('createLote.result', result);
    return result;
  }

  @SubscribeMessage('updateLote')
  @RequirePermissions('lotes.editar')
  @UsePipes(new ValidationPipe())
  async updateLote(@MessageBody() payload: GeoUpdateLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.updateLote(payload.id, payload.data);
    client.emit('updateLote.result', result);
    return result;
  }

  @SubscribeMessage('removeLote')
  @RequirePermissions('lotes.eliminar')
  @UsePipes(new ValidationPipe())
  async removeLote(@MessageBody() data: GeoRemoveLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.removeLote(data.id);
    client.emit('removeLote.result', result);
    return result;
  }

  // ==================== SUBLOTES ====================
  
  @SubscribeMessage('findAllSubLotes')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findAllSubLotes(@MessageBody() filters: GeoFindAllSubLotesDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findAllSubLotes(filters.loteId);
    client.emit('findAllSubLotes.result', result);
    return result;
  }

  @SubscribeMessage('findSubLoteById')
  @RequirePermissions('lotes.ver')
  @UsePipes(new ValidationPipe())
  async findSubLoteById(@MessageBody() data: GeoFindSubLoteByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findSubLoteById(data.id);
    client.emit('findSubLoteById.result', result);
    return result;
  }

  @SubscribeMessage('createSubLote')
  @RequirePermissions('lotes.crear')
  @UsePipes(new ValidationPipe())
  async createSubLote(@MessageBody() createSubLoteDto: GeoCreateSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.createSubLote(createSubLoteDto);
    client.emit('createSubLote.result', result);
    return result;
  }

  @SubscribeMessage('updateSubLote')
  @RequirePermissions('lotes.editar')
  @UsePipes(new ValidationPipe())
  async updateSubLote(@MessageBody() payload: GeoUpdateSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.updateSubLote(payload.id, payload.data);
    client.emit('updateSubLote.result', result);
    return result;
  }

  @SubscribeMessage('removeSubLote')
  @RequirePermissions('lotes.eliminar')
  @UsePipes(new ValidationPipe())
  async removeSubLote(@MessageBody() data: GeoRemoveSubLoteDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.removeSubLote(data.id);
    client.emit('removeSubLote.result', result);
    return result;
  }

  // ==================== CULTIVOS ====================
  
  @SubscribeMessage('findAllCultivos')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findAllCultivos(@MessageBody() filters: GeoFindAllCultivosDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findAllCultivos(filters);
    client.emit('findAllCultivos.result', result);
    return result;
  }

  @SubscribeMessage('findCultivoById')
  @RequirePermissions('cultivos.ver')
  @UsePipes(new ValidationPipe())
  async findCultivoById(@MessageBody() data: GeoFindCultivoByIdDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.findCultivoById(data.id);
    client.emit('findCultivoById.result', result);
    return result;
  }

  @SubscribeMessage('createCultivo')
  @RequirePermissions('cultivos.crear')
  @UsePipes(new ValidationPipe())
  async createCultivo(@MessageBody() createCultivoDto: GeoCreateCultivoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.createCultivo(createCultivoDto);
    client.emit('createCultivo.result', result);
    return result;
  }

  @SubscribeMessage('updateCultivo')
  @RequirePermissions('cultivos.editar')
  @UsePipes(new ValidationPipe())
  async updateCultivo(@MessageBody() payload: GeoUpdateCultivoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.updateCultivo(payload.id, payload.data);
    client.emit('updateCultivo.result', result);
    return result;
  }

  @SubscribeMessage('removeCultivo')
  @RequirePermissions('cultivos.eliminar')
  @UsePipes(new ValidationPipe())
  async removeCultivo(@MessageBody() data: GeoRemoveCultivoDoDto, @ConnectedSocket() client: Socket) {
    const result = await this.geoController.removeCultivo(data.id);
    client.emit('removeCultivo.result', result);
    return result;
  }
}
