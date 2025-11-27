import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IotService } from '../services/iot.service';
import {
  IotCreateSensorDoDto,
  IotRemoveSensorDoDto,
  IotFindAllLecturasDoDto,
  IotCreateLecturaDoDto,
} from '../dtos/iot-do.dto';
import { WsJwtGuard } from '../../../common/guards/ws-jwt.guard';
import { WsPermissionsGuard } from '../../../common/guards/ws-permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { WsCurrentUser } from '../../../common/decorators/ws-current-user.decorator';

@WebSocketGateway({ namespace: 'iot', cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsPermissionsGuard)
export class IotGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly iotService: IotService) {}

  @SubscribeMessage('findAllSensors')
  @RequirePermissions('iot.ver')
  async findAllSensors(@ConnectedSocket() client: Socket) {
    const result = await this.iotService.findAllSensors();
    client.emit('findAllSensors.result', result);
    return result;
  }

  @SubscribeMessage('createSensor')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createSensor(
    @MessageBody() createSensorDto: IotCreateSensorDoDto,
    @WsCurrentUser() user: any,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.iotService.createSensor(createSensorDto, user.id);
    client.emit('createSensor.result', result);
    return result;
  }

  @SubscribeMessage('removeSensor')
  @RequirePermissions('iot.eliminar')
  async removeSensor(
    @MessageBody() data: IotRemoveSensorDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.iotService.removeSensor(data.id);
    client.emit('removeSensor.result', result);
    return result;
  }

  @SubscribeMessage('findAllLecturas')
  @RequirePermissions('iot.ver')
  async findAllLecturas(
    @MessageBody() data: IotFindAllLecturasDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.iotService.findAllLecturas(data.sensorId);
    client.emit('findAllLecturas.result', result);
    return result;
  }

  @SubscribeMessage('createLectura')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createLectura(
    @MessageBody() createLecturaDto: IotCreateLecturaDoDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Pass 'this' (gateway instance) directly to service
    const result = await this.iotService.createLectura(createLecturaDto, this);
    client.emit('createLectura.result', result);
    return result;
  }

  // RF34: Emitir lectura en tiempo real
  emitLectura(lectura: any) {
    this.server.emit('nuevaLectura', lectura);
  }
}
