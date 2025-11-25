import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe, ParseIntPipe, Req, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import type { Request } from 'express';
import { IotService } from '../services/iot.service';
import { IotCreateSensorDoDto, IotRemoveSensorDoDto, IotFindAllLecturasDoDto, IotCreateLecturaDoDto } from '../dtos/iot-do.dto';
import { HttpSensorReadingDto } from '../dtos/http-sensor-reading.dto';
import { CreateTipoSensorDto } from '../dtos/create-tipo-sensor.dto';
import { UpdateTipoSensorDto } from '../dtos/update-tipo-sensor.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

@Controller('iot')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  private extractUserId(request: Request | any): number {
    const userId = request?.user?.id ?? request?.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('No se pudo resolver el usuario autenticado');
    }
    return userId;
  }

  // ==================== HTTP ENDPOINTS ====================

  @Get('sensores')
  @RequirePermissions('iot.ver')
  async findAllSensorsHttp(@Query() pagination: PaginationDto, @Query('tipoSensorId') tipoSensorId?: number, @Query('loteId') loteId?: number, @Query('estadoConexion') estadoConexion?: string) {
    return this.iotService.findAllSensorsPaginated(pagination, { tipoSensorId, loteId, estadoConexion });
  }

  @Post('sensores')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createSensorHttp(@Req() req: Request, @Body() dto: IotCreateSensorDoDto) {
    const userId = this.extractUserId(req);
    return this.createSensor(dto, userId);
  }

  @Delete('sensores/:id')
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

  @Post('lecturas')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createLecturaHttp(@Body() dto: IotCreateLecturaDoDto) {
    return this.createLectura(dto, undefined);
  }

  // RF33: HTTP endpoint for sensor data ingestion
  // TODO: Add authentication for sensor security (e.g., API key validation)
  @Post('sensores/:sensorId/readings/http')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async createSensorReadingHttp(
    @Param('sensorId', ParseIntPipe) sensorId: number,
    @Body() dto: HttpSensorReadingDto
  ) {
    // Validate sensor exists and is active
    const sensor = await this.iotService.findSensorById(sensorId);
    if (!sensor.activo) {
      throw new UnauthorizedException('Sensor is not active');
    }

    // Parse payload and create lectura
    const fechaLectura = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const lecturaDto = {
      sensorId,
      valor: dto.value,
      fechaLectura,
    };

    return this.iotService.createLectura(lecturaDto);
  }

  // ==================== TIPO SENSOR ENDPOINTS ====================

  @Get('tipos-sensor')
  @RequirePermissions('iot.ver')
  async findAllTiposSensorHttp(@Query() pagination: PaginationDto, @Query('q') q?: string) {
    return this.iotService.findAllTiposSensorPaginated(pagination, { q });
  }

  @Post('tipos-sensor')
  @RequirePermissions('iot.crear')
  @UsePipes(new ValidationPipe())
  async createTipoSensorHttp(@Body() dto: CreateTipoSensorDto) {
    return this.iotService.createTipoSensor(dto);
  }

  @Get('tipos-sensor/:id')
  @RequirePermissions('iot.ver')
  async findTipoSensorByIdHttp(@Param('id', ParseIntPipe) id: number) {
    return this.iotService.findTipoSensorById(id);
  }

  @Patch('tipos-sensor/:id')
  @RequirePermissions('iot.editar')
  @UsePipes(new ValidationPipe())
  async updateTipoSensorHttp(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoSensorDto) {
    return this.iotService.updateTipoSensor(id, dto);
  }

  @Delete('tipos-sensor/:id')
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
