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
import { UpdateSensorDto } from '../dtos/update-sensor.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@Controller('iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotController {
  constructor(private readonly iotService: IotService) { }

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
  async getGlobalConfigs() {
    return this.iotService.getGlobalConfigs();
  }

  @Post('config')
  @RequirePermissions('iot.editar')
  async createGlobalConfig(@Body() body: any) {
    return this.iotService.createGlobalConfig(body);
  }

  @Patch('config/:id')
  @RequirePermissions('iot.editar')
  async updateGlobalConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.iotService.updateGlobalConfig(id, body);
  }

  @Delete('config/:id')
  @RequirePermissions('iot.eliminar')
  async deleteGlobalConfig(@Param('id', ParseIntPipe) id: number) {
    console.log(`[IoTController] Request to delete Global Config ID: ${id}`);
    return this.iotService.deleteGlobalConfig(id);
  }

  @Post('reset-seed')
  @RequirePermissions('iot.eliminar')
  async resetAndSeed() {
    return this.iotService.resetAndSeed();
  }

  @Get('sensors')
  @RequirePermissions('iot.ver')
  async findAllSensorsHttp(
    @Query('loteId') loteId?: string,
    @Query('subLoteId') subLoteId?: string,
  ) {
    const lId = loteId ? parseInt(loteId, 10) : undefined;
    const slId = subLoteId ? parseInt(subLoteId, 10) : undefined;
    return this.findAllSensors(lId, slId);
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
    @Body() dto: UpdateSensorDto,
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
    console.log(`[IoTController] Request to delete Sensor ID: ${id}`);
    return this.removeSensor({ id });
  }

  @Get('lecturas')
  @RequirePermissions('iot.ver')
  async findAllLecturasHttp(@Query('sensorId') sensorId?: string) {
    const sensorIdNum = sensorId ? parseInt(sensorId, 10) : undefined;
    return this.findAllLecturas({ sensorId: sensorIdNum });
  }

  @Get('alerts')
  @RequirePermissions('iot.ver')
  async findAlertsHttp(
    @Query('sensorId') sensorId?: string,
    @Query('loteId') loteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.iotService.findAlerts({
      sensorId: sensorId ? parseInt(sensorId, 10) : undefined,
      loteId: loteId ? parseInt(loteId, 10) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('alerts/:id/context')
  @RequirePermissions('iot.ver')
  async getAlertContextHttp(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.getAlertContext(id);
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

  @Get('sensors/:id/aggregated')
  @RequirePermissions('iot.ver')
  async getAggregatedReadings(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: 'hour' | 'day' | 'week',
  ) {
    return this.iotService.getAggregatedReadings(
      id,
      new Date(from),
      new Date(to),
      interval,
    );
  }

  @Get('general-report')
  @RequirePermissions('iot.ver')
  async getGeneralReportHttp(
    @Query('loteId') loteId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sensorId') sensorId?: string,
  ) {
    const lId = loteId ? parseInt(loteId, 10) : undefined;
    const sId = sensorId ? parseInt(sensorId, 10) : undefined;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.iotService.getGeneralReport({
      loteId: lId,
      startDate: start,
      endDate: end,
      sensorId: sId,
    });
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
  async findAllSensors(loteId?: number, subLoteId?: number) {
    return this.iotService.findAllSensors(loteId, subLoteId);
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

  async updateSensor(id: number, data: Partial<IotCreateSensorDoDto> | UpdateSensorDto) {
    return this.iotService.updateSensor(id, data as any);
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

  @Get('comparison')
  @RequirePermissions('iot.ver')
  async getLotsComparison(
    @Query('loteIds') loteIds?: string,
    @Query('tipoSensorId') tipoSensorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedLoteIds = loteIds
      ? loteIds.split(',').map((id) => parseInt(id, 10))
      : undefined;
    const parsedTipoSensorId = tipoSensorId
      ? parseInt(tipoSensorId, 10)
      : undefined;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.iotService.getLotsComparison(
      parsedLoteIds,
      parsedTipoSensorId,
      start,
      end,
    );
  }
}
