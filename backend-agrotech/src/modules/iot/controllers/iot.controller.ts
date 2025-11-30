import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Req,
  UnauthorizedException,
  DefaultValuePipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { IotService } from '../services/iot.service';
import {
  IotCreateSensorDoDto,
  IotRemoveSensorDoDto,
  IotFindAllLecturasDoDto,
  IotCreateLecturaDoDto,
} from '../dtos/iot-do.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  private extractUserId(request: Request | any): number {
    const userId = request?.user?.id ?? request?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo resolver el usuario autenticado',
      );
    }
    return userId;
  }

  // ==================== HTTP ENDPOINTS ====================

  @Get('config')
  @RequirePermissions('iot.ver')
  async getGlobalConfig() {
    return this.iotService.getGlobalConfig();
  }

  @Post('config')
  @RequirePermissions('iot.editar')
  async saveGlobalConfig(@Body() body: any) {
    return this.iotService.saveGlobalConfig(body);
  }

  @Post('reset-seed')
  @RequirePermissions('iot.eliminar')
  async resetAndSeed() {
    return this.iotService.resetAndSeed();
  }

  @Get('sensors')
  @RequirePermissions('iot.ver')
  async findAllSensorsHttp() {
    return this.findAllSensors();
  }

  @Post('sensors')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createSensorHttp(
    @Req() req: Request,
    @Body() dto: IotCreateSensorDoDto,
  ) {
    const userId = this.extractUserId(req);
    return this.createSensor(dto, userId);
  }

  @Patch('sensors/:id')
  @RequirePermissions('iot.editar')
  async updateSensorHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<IotCreateSensorDoDto>,
  ) {
    return this.updateSensor(id, dto);
  }

  @Patch('sensors/:id/toggle')
  @RequirePermissions('iot.editar')
  async toggleSensorStatusHttp(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.toggleSensorStatus(id);
  }

  @Delete('sensors/:id')
  @RequirePermissions('iot.eliminar')
  async removeSensorHttp(@Param('id', ParseIntPipe) id: number) {
    return this.removeSensor({ id });
  }

  @Get('lecturas')
  @RequirePermissions('iot.ver')
  async findAllLecturasHttp(@Query('sensorId') sensorId?: string) {
    const sensorIdNum = sensorId ? parseInt(sensorId) : undefined;
    return this.findAllLecturas({ sensorId: sensorIdNum });
  }

  async createLecturaHttp(@Body() dto: IotCreateLecturaDoDto) {
    return this.createLectura(dto, undefined);
  }

  @Get('sensors/:id')
  @RequirePermissions('iot.ver')
  async findOneSensorHttp(@Param('id', ParseIntPipe) id: number) {
    return this.getSensorById(id);
  }

  @Get('sensors/:id/readings')
  @RequirePermissions('iot.ver')
  async getSensorReadingsHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.iotService.getUltimasLecturas(id, limit);
  }

  // ==================== TIPO SENSOR ENDPOINTS ====================

  @Get('sensor-types')
  @RequirePermissions('iot.ver')
  async findAllTiposSensorHttp() {
    return this.iotService.findAllTiposSensor();
  }

  @Post('sensor-types')
  @RequirePermissions('iot.crear')
  async createTipoSensorHttp(
    @Body() data: { nombre: string; unidad: string; descripcion?: string },
  ) {
    return this.iotService.createTipoSensor(data);
  }

  @Get('sensor-types/:id')
  @RequirePermissions('iot.ver')
  async findOneTipoSensorHttp(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.findTipoSensorById(id);
  }

  @Patch('sensor-types/:id')
  @RequirePermissions('iot.editar')
  async updateTipoSensorHttp(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.iotService.updateTipoSensor(id, data);
  }

  @Delete('sensor-types/:id')
  @RequirePermissions('iot.eliminar')
  async removeTipoSensorHttp(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.removeTipoSensor(id);
  }

  // ==================== INTERNAL METHODS ====================

  // Internal method for WebSocket: handles finding all sensors by calling the service
  // Flow: Gateway calls this method -> calls iotService.findAllSensors -> returns sensors list
  async findAllSensors() {
    return this.iotService.findAllSensors();
  }

  async getSensorById(id: number) {
    return this.iotService.findSensorById(id);
  }

  // RF34: Obtener estado de conexión de un sensor
  async getSensorStatus(id: number) {
    return this.iotService.getSensorStatus(id);
  }

  // Internal method for WebSocket: handles creating a sensor by calling the service
  // Flow: Gateway calls this method -> calls iotService.createSensor -> returns created sensor
  @UsePipes(new ValidationPipe())
  async createSensor(createSensorDto: IotCreateSensorDoDto, userId: number) {
    return this.iotService.createSensor(createSensorDto, userId);
  }

  async updateSensor(id: number, data: Partial<IotCreateSensorDoDto>) {
    return this.iotService.updateSensor(id, data);
  }

  // Internal method for WebSocket: handles removing a sensor by calling the service
  // Flow: Gateway calls this method -> calls iotService.removeSensor -> returns removed sensor
  async removeSensor(data: IotRemoveSensorDoDto) {
    return this.iotService.removeSensor(data.id);
  }

  // Internal method for WebSocket: handles finding all lecturas by calling the service
  // Flow: Gateway calls this method -> calls iotService.findAllLecturas -> returns lecturas list
  async findAllLecturas(data: IotFindAllLecturasDoDto) {
    return this.iotService.findAllLecturas(data.sensorId);
  }

  // Internal method for WebSocket: handles creating a lectura by calling the service
  // Flow: Gateway calls this method -> calls iotService.createLectura -> returns created lectura
  @UsePipes(new ValidationPipe())
  async createLectura(createLecturaDto: IotCreateLecturaDoDto, gateway: any) {
    return this.iotService.createLectura(createLecturaDto, gateway);
  }
}
