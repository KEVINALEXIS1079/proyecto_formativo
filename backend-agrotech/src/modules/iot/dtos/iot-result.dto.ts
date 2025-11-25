import { Sensor } from '../entities/sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';

export type IotFindAllSensorsResultDto = Sensor[];

export type IotCreateSensorResultDto = Sensor;

export type IotRemoveSensorResultDto = Sensor;

export type IotFindAllLecturasResultDto = SensorLectura[];

export type IotCreateLecturaResultDto = SensorLectura;