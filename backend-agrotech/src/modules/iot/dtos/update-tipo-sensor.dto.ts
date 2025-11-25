import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoSensorDto } from './create-tipo-sensor.dto';

export class UpdateTipoSensorDto extends PartialType(CreateTipoSensorDto) {}