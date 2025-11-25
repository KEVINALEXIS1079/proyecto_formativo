import { IsNumber, IsOptional } from 'class-validator';
import { CreateSensorDto } from './create-sensor.dto';
import { CreateSensorLecturaDto } from './create-sensor-lectura.dto';

export class IotFindAllSensorsDoDto {
  // Add filters if needed, e.g., @IsOptional() @IsString() q?: string;
}

export class IotCreateSensorDoDto extends CreateSensorDto {}

export class IotRemoveSensorDoDto {
  @IsNumber()
  id: number;
}

export class IotFindAllLecturasDoDto {
  @IsOptional()
  @IsNumber()
  sensorId?: number;
}

export class IotCreateLecturaDoDto extends CreateSensorLecturaDto {}