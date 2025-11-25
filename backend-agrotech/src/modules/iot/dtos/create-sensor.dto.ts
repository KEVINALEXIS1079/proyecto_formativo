import { 
  IsString, 
  IsOptional, 
  IsNotEmpty, 
  IsNumber,
  IsEnum,
  Min
} from 'class-validator';

export enum ProtocoloSensor {
  HTTP = 'HTTP',
  MQTT = 'MQTT',
  WEBSOCKET = 'WEBSOCKET',
}

export class CreateSensorDto {
  @IsNotEmpty({ message: 'El nombre del sensor es requerido' })
  @IsString({ message: 'El nombre del sensor debe ser un texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El ID del tipo de sensor es requerido' })
  @IsNumber({}, { message: 'El ID del tipo de sensor debe ser un número' })
  tipoSensorId: number;

  @IsNotEmpty({ message: 'El protocolo es requerido' })
  @IsEnum(ProtocoloSensor, { 
    message: 'El protocolo debe ser uno de: HTTP, MQTT, WEBSOCKET' 
  })
  protocolo: ProtocoloSensor;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del cultivo debe ser un número' })
  cultivoId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  loteId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del sublote debe ser un número' })
  subLoteId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral mínimo debe ser un número' })
  umbralMin?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral máximo debe ser un número' })
  umbralMax?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El TTL debe ser un número' })
  @Min(1, { message: 'El TTL debe ser al menos 1 minuto' })
  ttlMinutos?: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}
