import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ActivitiesController } from '../controllers/activities.controller';
import {
  ActivitiesCreateDoDto,
  ActivitiesFindAllDoDto,
  ActivitiesFindOneDoDto,
  ActivitiesUpdateDoDto,
  ActivitiesRemoveDoDto,
} from '../dtos/activities-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { WsCurrentUser } from '../../../common/decorators/ws-current-user.decorator';

@WebSocketGateway({ namespace: 'activities', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class ActivitiesGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ActivitiesController))
    private readonly activitiesController: ActivitiesController,
  ) {}

  @SubscribeMessage('createActivity')
  @RequirePermissions('actividades.crear')
  @UsePipes(new ValidationPipe())
  async create(
    @MessageBody() createActivityDto: ActivitiesCreateDoDto,
    @WsCurrentUser() user: any,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.activitiesController.create(createActivityDto, user.id);
    client.emit('createActivity.result', result);
    return result;
  }

  @SubscribeMessage('findAllActivities')
  @RequirePermissions('actividades.ver')
  @UsePipes(new ValidationPipe())
  async findAll(
    @MessageBody() filters: ActivitiesFindAllDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.activitiesController.findAll();
    client.emit('findAllActivities.result', result);
    return result;
  }

  @SubscribeMessage('findOneActivity')
  @RequirePermissions('actividades.ver')
  @UsePipes(new ValidationPipe())
  async findOne(
    @MessageBody() data: ActivitiesFindOneDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.activitiesController.findOne(data.id);
    client.emit('findOneActivity.result', result);
    return result;
  }

  @SubscribeMessage('updateActivity')
  @RequirePermissions('actividades.editar')
  @UsePipes(new ValidationPipe())
  async update(
    @MessageBody() payload: ActivitiesUpdateDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.activitiesController.update(payload.id, payload.data);
    client.emit('updateActivity.result', result);
    return result;
  }

  @SubscribeMessage('removeActivity')
  @RequirePermissions('actividades.eliminar')
  @UsePipes(new ValidationPipe())
  async remove(
    @MessageBody() data: ActivitiesRemoveDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.activitiesController.remove(data.id);
    client.emit('removeActivity.result', result);
    return result;
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
