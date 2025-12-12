import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UsersController } from '../controllers/users.controller';
import { UsersFindAllDoDto, UsersFindByIdDoDto, UsersRemoveDoDto } from '../dtos/users-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { UserStatus } from '../dtos/user-management.dto';

import { forwardRef, Inject } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@WebSocketGateway({ namespace: 'users', cors: { origin: true, credentials: true } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class UsersGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) { }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  @SubscribeMessage('users:findAll')
  @RequirePermissions('usuarios.ver')
  @UsePipes(new ValidationPipe())
  async handleFindAll(
    @MessageBody() filters: UsersFindAllDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const users = await this.usersService.findAll({
        ...filters,
        estado: filters.estado as UserStatus,
      });
      const sanitized = users.map(user => this.sanitizeUser(user));
      client.emit('users:list', sanitized);
      return sanitized;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('users:findById')
  @RequirePermissions('usuarios.ver')
  @UsePipes(new ValidationPipe())
  async handleFindById(
    @MessageBody() data: UsersFindByIdDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.usersService.findById(data.id);
      const sanitized = this.sanitizeUser(user);
      client.emit('users:detail', sanitized);
      return sanitized;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('users:remove')
  @RequirePermissions('usuarios.eliminar')
  @UsePipes(new ValidationPipe())
  async handleRemove(
    @MessageBody() data: UsersRemoveDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.usersService.remove(data.id);
      client.emit('users:removed', result);
      this.server.emit('users:updated'); // Notificar a todos
      return result;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }
}
