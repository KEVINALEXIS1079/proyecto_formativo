import { IsBoolean, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSensorDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  mqttTopic?: string;

  @IsInt()
  @IsOptional()
  globalConfigId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral mínimo debe ser un número' })
  umbralMin?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral máximo debe ser un número' })
  umbralMax?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  loteId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del sublote debe ser un número' })
  subLoteId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del tipo de sensor debe ser un número' })
  tipoSensorId?: number;
}
